import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedMood } from "../types";

// Helper to convert File to Base64 for Gemini
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

export const analyzePhotosAndGetMood = async (files: File[]): Promise<GeneratedMood> => {
  if (!files || files.length === 0) {
    throw new Error("No files provided");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";

  const imageParts = await Promise.all(files.map(fileToGenerativePart));

  const prompt = `
    你是一个韩式大头贴（人生四格）APP的美学顾问。
    请分析这 ${files.length} 张照片。
    1. 生成一个非常简短、可爱或感性的标题（最多8个字），适合打印在照片条底部。可以使用中文，或者中文加Emoji。
    2. 建议一个与照片相配的背景HEX颜色代码（例如淡粉色、柔和的蓝色、深灰色）。
    3. 用一个词描述整体氛围（例如：“浪漫”、“开心”、“复古”）。
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        role: "user",
        parts: [...imageParts, { text: prompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            caption: { type: Type.STRING },
            suggestedColor: { type: Type.STRING },
            mood: { type: Type.STRING }
          },
          required: ["caption", "suggestedColor", "mood"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text) as GeneratedMood;
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback if AI fails
    return {
      caption: "美好时刻 ✨",
      suggestedColor: "#fce7f3",
      mood: "开心"
    };
  }
};