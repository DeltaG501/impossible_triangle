import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTradeOffs = async (context: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are an expert project manager and systems thinker. 
      The user is facing a project triangle constraint (Fast, Good/Accurate, Cheap/Saving) problem in the context of: "${context}".
      
      Please explain:
      1. What "Fast" (快), "Accurate" (准), and "Cheap" (省) specifically mean in this context.
      2. Why achieving all three simultaneously is impossible or extremely difficult (the "Impossible Triangle").
      3. Give concrete examples of what happens when you pick only two (e.g., Fast + Cheap = Low Quality).
      
      Keep the response concise, structured, and insightful. Limit to 300 words.
      Use Markdown formatting.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate analysis. Please try again.");
  }
};
