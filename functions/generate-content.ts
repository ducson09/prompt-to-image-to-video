// netlify/functions/generate-content.ts
import { GoogleGenAI, Modality, Part } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Helper to convert base64 data URL to a Gemini Part
function dataUrlToGeminiPart(dataUrl: string): Part {
    const [header, data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
    return {
        inlineData: { mimeType, data },
    };
}

exports.handler = async (event) => {
  // Chỉ cho phép phương thức POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { type, payload } = JSON.parse(event.body);

    if (type === 'image') {
      const { prompt, characterImages, sceneImage } = payload;
      const parts: Part[] = [];
      let fullPrompt = "";

      if (sceneImage) {
        parts.push(dataUrlToGeminiPart(sceneImage));
        characterImages.forEach(img => parts.push(dataUrlToGeminiPart(img)));
        const charRef = characterImages.length > 1 ? `các nhân vật từ ${characterImages.length} ảnh tham chiếu tiếp theo` : `nhân vật từ ảnh tham chiếu tiếp theo`;
        fullPrompt = `Sử dụng ảnh đầu tiên làm bối cảnh nền. Thêm ${charRef} vào bối cảnh này. Mô tả hành động và bố cục: "${prompt}". Giữ ngoại hình nhân vật nhất quán với ảnh tham chiếu. Tạo ảnh chất lượng 4K với tỷ lệ khung hình 9:16.`;
      } else {
        characterImages.forEach(img => parts.push(dataUrlToGeminiPart(img)));
        const charRef = characterImages.length > 1 ? 'các nhân vật' : 'nhân vật';
        fullPrompt = `Tạo một ảnh mới với ${charRef} từ các ảnh tham chiếu được cung cấp. Mô tả bối cảnh, hành động và bố cục: "${prompt}". Giữ ngoại hình nhân vật nhất quán. Tạo ảnh chất lượng 4K với tỷ lệ khung hình 9:16.`;
      }
      parts.push({ text: fullPrompt });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: parts },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
      });

      // Trả về kết quả cho client
      return {
        statusCode: 200,
        body: JSON.stringify(response),
      };

    } else if (type === 'video') {
      const { base64Image, prompt } = payload;
      const [, data] = base64Image.split(',');
      const [header] = base64Image.split(';');
      const mimeType = header.split(':')[1] || 'image/png';

      let operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: prompt,
        image: { imageBytes: data, mimeType: mimeType },
        config: { numberOfVideos: 1 },
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
      }
      
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) {
          throw new Error("Tạo video thành công nhưng không có link tải xuống.");
      }

      // Trả về link để client tự fetch (an toàn hơn)
      return {
        statusCode: 200,
        body: JSON.stringify({ downloadLink: `${downloadLink}&key=${API_KEY}` }),
      };

    } else {
      return { statusCode: 400, body: 'Invalid request type' };
    }

  } catch (error) {
    console.error("Error in Netlify function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};