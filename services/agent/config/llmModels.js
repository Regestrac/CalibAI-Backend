import { ChatGroq } from "@langchain/groq";
import { ChatOpenRouter } from "@langchain/openrouter";
import { ChatGoogle } from "@langchain/google";

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

const gemini = new ChatGoogle({
  model: "gemini-3.5-flash-lite",
})

export const getModel = async (agent) => {
  switch (agent) {
    case "chat":
      return gpt;
    case "search":
      return compound;
    case "coding":
      return openRouterCodingMiniMax;
    case "pdfRag":
      return compound;
    case "imageAnalyzer":
      return gemini;
    default:
      return compound;
  };
};