import { getModel } from "../config/llmModels.js"

const validAgents = ["chat", "coding", "search", "image", "pdf", "ppt"];

export const router = async (state) => {
  if (state?.agent && state?.agent !== "auto") {
    return {
      ...state,
      agent: state.agent,
    }
  }

  const llm = await getModel("router");

  const prompt = `
    You are a router for CalibAI. Choose exactly one agent from: chat, search, coding, image, pdf, ppt.

    Rules:
    - chat: general Q&A, explanations, opinions, learning (not code, not real-time data).
    - search: real-time info, news, weather, stocks, current events, or anything requiring internet lookup.
    - coding: write, fix, explain, or design code, APIs, architecture, or algorithms.
    - image: generate, edit, analyze, or describe images.
    - pdf: extract, summarize, or answer questions about PDF content (not how to code PDF generation).
    - ppt: extract, summarize, or answer questions about PPT content (not how to code PPT generation).

    Priority: If query involves both coding and real-time data → choose "coding" (assume user wants code, not just the data). If unsure → choose "chat".

    User Query: ${state.prompt}

    Return only the agent name, nothing else.
  `

  const response = await llm.invoke(prompt);
  const agent = response?.content?.trim()?.toLowerCase() || "";
  const sanitized = validAgents.includes(agent) ? agent : "chat";

  return {
    ...state,
    agent: sanitized,
  }
};