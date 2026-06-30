import { ChatGroq } from "@langchain/groq";
import { ChatOpenRouter } from "@langchain/openrouter";
import { ChatGoogle } from "@langchain/google";

const defaultModel = new ChatGroq({
  model: "qwen/qwen3.8-27b",
});

const chatModel = new ChatGroq({
  model: "openai/gpt-oss-120b",
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
      return chatModel;
    case "search":
      return defaultModel;
    case "coding":
      return openRouterCodingMiniMax;
    case "pdfRag":
      return defaultModel;
    case "imageAnalyzer":
      return gemini;
    default:
      return defaultModel;
  };
};