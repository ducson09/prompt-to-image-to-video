import { GoogleGenAI, Modality, Part } from "@google/genai";

// Ensure process.env.API_KEY is available. In a real app, this would be handled by the build environment.
// For this example, we'll assume it's set. If not, replace it with your key for testing, but don't commit it.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // A real app should handle this more gracefully.
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

function dataUrlToGeminiPart(dataUrl: string): Part {
  const [header, data] = dataUrl.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
  return {
    inlineData: {
      mimeType,
      data,
    },
  };
}

export async function generateImage(
  prompt: string,
  characterImages: string[],
  sceneImage: string | null
): Promise<string> {
  try {
    const parts: Part[] = [];
    let fullPrompt = "";

    if (sceneImage) {
      // If a scene is provided, it's the base image. Add it first.
      parts.push(dataUrlToGeminiPart(sceneImage));
      // Then add character references.
      characterImages.forEach(img => parts.push(dataUrlToGeminiPart(img)));
      
      const characterRef = characterImages.length > 1 
        ? `các nhân vật từ ${characterImages.length} ảnh tham chiếu tiếp theo` 
        : `nhân vật từ ảnh tham chiếu tiếp theo`;

      fullPrompt = `Sử dụng ảnh đầu tiên làm bối cảnh nền. Thêm ${characterRef} vào bối cảnh này. Mô tả hành động và bố cục: "${prompt}". Giữ ngoại hình nhân vật nhất quán với ảnh tham chiếu. Tạo ảnh chất lượng 4K với tỷ lệ khung hình 9:16.`;
    } else {
      // If no scene, the characters are the main subject.
      characterImages.forEach(img => parts.push(dataUrlToGeminiPart(img)));

      const characterRef = characterImages.length > 1 ? 'các nhân vật' : 'nhân vật';

      fullPrompt = `Tạo một ảnh mới với ${characterRef} từ các ảnh tham chiếu được cung cấp. Mô tả bối cảnh, hành động và bố cục: "${prompt}". Giữ ngoại hình nhân vật nhất quán. Tạo ảnh chất lượng 4K với tỷ lệ khung hình 9:16.`;
    }

    // Add the consolidated text prompt at the end
    parts.push({ text: fullPrompt });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    if (response.promptFeedback?.blockReason) {
        throw new Error(`Yêu cầu bị chặn vì lý do an toàn: ${response.promptFeedback.blockReason}. Vui lòng điều chỉnh câu lệnh hoặc ảnh đầu vào.`);
    }

    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

    if (imagePart && imagePart.inlineData) {
      const base64ImageBytes: string = imagePart.inlineData.data;
      const mimeType = imagePart.inlineData.mimeType;
      return `data:${mimeType};base64,${base64ImageBytes}`;
    } else {
      const textResponse = response.text;
      let detailedError = `API không trả về hình ảnh.`;
      if (textResponse) {
          detailedError += ` Phản hồi từ AI: "${textResponse}"`;
      } else {
          detailedError += ` Không có phản hồi văn bản. Vui lòng thử lại với câu lệnh khác hoặc kiểm tra lại ảnh đầu vào.`;
      }
      throw new Error(detailedError);
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        // Re-throw the specific error message we constructed or caught.
        throw new Error(error.message);
    }
    throw new Error('Đã xảy ra lỗi không xác định trong quá trình tạo ảnh.');
  }
}

export async function generateVideo(
  base64Image: string,
  prompt: string
): Promise<string> {
  try {
    const [, data] = base64Image.split(',');
    const [header] = base64Image.split(';');
    const mimeType = header.split(':')[1] || 'image/png';

    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: prompt,
      image: {
        imageBytes: data,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1,
      },
    });

    while (!operation.done) {
      // Wait for 10 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("Tạo video thành công nhưng không có liên kết tải xuống.");
    }
    
    // Fetch the video and convert to a data URL
    const videoResponse = await fetch(`${downloadLink}&key=${API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error(`Không thể tải video: ${videoResponse.statusText}`);
    }
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);

  } catch (error) {
    console.error("Error calling VEO API:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Đã xảy ra lỗi không xác định trong quá trình tạo video.');
  }
}