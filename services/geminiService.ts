import { GoogleGenerativeAI } from "@google/generative-ai";
import { Transaction } from "../types";

export const analyzeFinances = async (transactions: Transaction[]): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) {
    return "Chave de API não encontrada. Defina VITE_GEMINI_API_KEY no .env.";
  }

  const ai = new GoogleGenerativeAI(apiKey);

  const summary = transactions
    .map(
      (t) =>
        `- ${t.date}: ${t.type} de R$${t.amount.toFixed(2)} (${t.category}) - ${t.description}`
    )
    .join("\n");

  const prompt = `
    Como um consultor financeiro especialista em Pet Shops, analise as seguintes transações recentes:
    
    ${summary}
    
    Por favor, forneça:
    1. Um breve resumo do desempenho (lucros vs gastos).
    2. Identifique qual categoria de serviço está sendo mais rentável.
    3. Dê 3 dicas práticas para aumentar a lucratividade ou reduzir custos específicos de um Pet Shop.
    
    Responda em português brasileiro de forma profissional e encorajadora.
  `;

  try {
    const model = ai.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent(prompt);
    return result.response.text() || "Não foi possível gerar a análise no momento.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Erro ao conectar com a inteligência artificial. Verifique sua chave de API.";
  }
};
