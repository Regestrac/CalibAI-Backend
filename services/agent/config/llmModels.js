import { ChatGroq } from "@langchain/groq";
import { ChatOpenRouter } from "@langchain/openrouter";

const gpt = new ChatGroq({
  model: "openai/gpt-oss-120b",
});

const compound = new ChatGroq({
  model: "groq/compound",
});

const openRouterCodingMiniMax = new ChatOpenRouter({
  // model: "deepseek/deepseek-chat",
  // model: "z-ai/glm-5.2:free",
  // model: "nvidia/nemotron-3-ultra-550b-a55b:free",
  model: "minimax/minimax-m3:free",
  // temperature: 0,
  // maxTokens: 2500,
});

const gemma = new ChatOpenRouter({
  model: "google/gemma-4-26b-a4b-it:free",
});

export const getModel = async (agent) => {
  switch (agent) {
    case "chat":
      return gpt;
    case "search":
      return compound;
    case "coding":
      return openRouterCodingMiniMax;
    case "pdfRag":
      return gemma;
    case "imageAnalyzer":
      return gemma;
    default:
      return compound;
  };
};