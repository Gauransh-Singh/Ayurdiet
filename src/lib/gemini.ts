import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateClinicalInsight(
  prakriti: string,
  symptoms: string,
  agni: string,
  koshtha: string
) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As an Ayurvedic expert, provide a brief clinical insight for a patient with:
        Prakriti: ${prakriti}
        Symptoms: ${symptoms}
        Agni (Digestive Fire): ${agni}
        Koshtha (Bowel Type): ${koshtha}
        
        Provide a concise analysis (max 150 words) focusing on the root cause and immediate dietary recommendations. 
        Use markdown for formatting: use bold for key terms, and bullet points for recommendations.`,
    });
    return response.text || "Unable to generate insight at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating insight. Please try again.";
  }
}
