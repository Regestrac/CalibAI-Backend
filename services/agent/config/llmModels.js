import { ChatGroq } from "@langchain/groq";

const gpt = new ChatGroq({
  model: "openai/gpt-oss-120b",
});

const compound = new ChatGroq({
  model: "groq/compound",
});

export const getModel = async (agent) => {
  switch (agent) {
    case "chat":
      return gpt;
    case "search":
      return compound;
    default:
      return compound;
  };
};