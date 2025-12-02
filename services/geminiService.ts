import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Quote } from "../types";

// Initialize Gemini Client
// CRITICAL: Using process.env.API_KEY as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const QUOTE_SCHEMA: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      text: { type: Type.STRING, description: "The quote content in Chinese." },
      category: { type: Type.STRING, description: "Category of the quote (e.g., 储蓄, 投资, 心态)." },
      interpretation: { type: Type.STRING, description: "A brief, inspiring interpretation of the quote." }
    },
    required: ["text", "category", "interpretation"]
  }
};

export const fetchBookQuotes = async (): Promise<Quote[]> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      Please list 9 distinct, impactful, and inspiring quotes from the book 'A Dog Named Money' (小狗钱钱) by Bodo Schäfer.
      Return the response in Chinese.
      Ensure the quotes cover different aspects like saving, compound interest, dreams, and confidence.
      The interpretation should be practical and encouraging.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: QUOTE_SCHEMA,
        systemInstruction: "You are an expert on the book 'A Dog Named Money'. Extract accurate quotes.",
      },
    });

    const data = JSON.parse(response.text || "[]");
    
    // Add IDs for React keys
    return data.map((item: any, index: number) => ({
      ...item,
      id: `quote-${index}-${Date.now()}`
    }));

  } catch (error) {
    console.error("Failed to fetch quotes:", error);
    // Fallback data in case of API failure (for demo robustness)
    return [
      {
        id: "fallback-1",
        text: "当你决定做一件事情的时候，你必须在72小时之内完成，否则你很可能永远不会做了。",
        category: "行动力",
        interpretation: "行动的黄金法则是趁热打铁，拖延是梦想的杀手。"
      },
      {
        id: "fallback-2",
        text: "尝试纯粹是一种借口，你还没有做，就已经给自己想好了退路。不能试验，你只有两个选择：做，或者不做。",
        category: "决心",
        interpretation: "全力以赴是成功的唯一途径，不要给自己留退路。"
      },
      {
        id: "fallback-3",
        text: "金钱有一些秘密和规律，要想了解这些秘密和规律，前提条件是，你自己必须真的有这个愿望。",
        category: "渴望",
        interpretation: "财富始于对财富的渴望和对知识的追求。"
      }
    ];
  }
};

export const chatWithMoneyTheDog = async (history: { role: string, parts: { text: string }[] }[], newMessage: string) => {
  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: `
          You are 'Money' (钱钱), the talking Labrador from the book 'A Dog Named Money'.
          You are wise, patient, encouraging, and knowledgeable about financial literacy for beginners.
          You speak in a friendly tone, suitable for both children and adults.
          Your goal is to help the user understand financial freedom, saving, investment, and building confidence.
          Always answer in Chinese.
          Keep answers concise (under 150 words) unless asked for details.
        `,
      },
      history: history,
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text;
  } catch (error) {
    console.error("Chat error:", error);
    return "汪！抱歉，我现在有点累了，请稍后再跟我说话吧。(API Error)";
  }
};
