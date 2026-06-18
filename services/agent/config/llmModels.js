import { ChatGroq } from "@langchain/groq";
import { ChatOpenRouter } from "@langchain/openrouter";

const gpt = new ChatGroq({
  model: "openai/gpt-oss-120b",
});

const compound = new ChatGroq({
  model: "groq/compound",
});

const openRouter = new ChatOpenRouter({
  // model: "deepseek/deepseek-chat",
  // model: "z-ai/glm-5.2:free",
  model: "nvidia/nemotron-3-ultra-550b-a55b:free",
  // temperature: 0,
  // maxTokens: 2500,
})

export const getModel = async (agent) => {
  switch (agent) {
    case "chat":
      return gpt;
    case "search":
      return compound;
    case "coding":
      return openRouter;
    default:
      return compound;
  };
};