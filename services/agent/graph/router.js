import { getModel } from "../config/llmModels.js"

export const router = async (state) => {
  const llm = getModel("router");

  const prompt = `
    You are a router for Calib AI.
    Use the following prompt to route the user's message to the appropriate agent.
    
    Available agents:
    - chat
    - search
    - coding
    - image
    - pdf
    - ppt

    Rules for redirecting:
    chat:
      General conversations, explanations, learning, questions, etc.
    search:
      Current events, latest information, newa, recent developments, internet lookup, etc.
    coding:
      Generating code, debug code, build project, architecture, API design, etc.
    pdf:
      Questions about generate PDFs or document context.
    ppt:
      Questions about generate PPTs or ppt context.
    image:
      Generate image, create image, etc.
    
    User Query: ${state.prompt}

    Retun only one word which should be the name of the agent from the available agents list, don't give any extra text or markup or explanation.
  `

  const response = await llm.invoke(prompt);

  return {
    ...state,
    agent: response?.content?.trim()?.toLowerCase(),
  }
};