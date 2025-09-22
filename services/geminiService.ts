import { GenerateContentResponse } from "@google/genai";

// Hàm này sẽ gọi đến Netlify function của chúng ta
async function callNetlifyFunction(type: 'image' | 'video', payload: any) {
  const response = await fetch('/.netlify/functions/generate-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type, payload }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Lỗi không xác định từ server function.' }));
    throw new Error(errorData.error || `Lỗi HTTP: ${response.status}`);
  }

  return response.json();
}

export async function generateImage(
  prompt: string,
  characterImages: string[],
  sceneImage: string | null
): Promise<string> {
  try {
    const response: GenerateContentResponse = await callNetlifyFunction('image', {
      prompt,
      characterImages,
      sceneImage,
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
    console.error("Error calling Netlify function for image generation:", error);
    if (error instanceof Error) {
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
    const { downloadLink } = await callNetlifyFunction('video', {
      base64Image,
      prompt,
    });

    if (!downloadLink) {
      throw new Error("Tạo video thành công nhưng không có liên kết tải xuống.");
    }
    
    // Fetch the video from the signed URL and convert to a blob URL
    const videoResponse = await fetch(downloadLink);
    if (!videoResponse.ok) {
        throw new Error(`Không thể tải video: ${videoResponse.statusText}`);
    }
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);

  } catch (error) {
    console.error("Error calling Netlify function for video generation:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Đã xảy ra lỗi không xác định trong quá trình tạo video.');
  }
}
