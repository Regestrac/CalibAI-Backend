import fs from "fs/promises";
import { getModel } from "../config/llmModels.js"
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { checkCredits } from "../utils/checkCredits.js";
import { deductCredits } from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimit.js";
import { logToFile } from "../utils/logToFile.js";

export const imageAnalyzerAgent = async (state) => {
  try {
    await checkAgentLimit(state.userId, "imageAnalyzer");
    await checkCredits(state?.userId, "imageAnalyzer");

    const llm = await getModel("imageAnalyzer");

    const imageBuffer = await fs.readFile(state?.file?.path);
    const base64Image = await imageBuffer.toString("base64");
    const mimeType = state?.file?.mimetype;

    const messages = [
      new SystemMessage(
        `You are CalibAI image analyzer agent.
        
        Rules:
        - Analyze only the uploaded image.
        - Answer the user's question accurately.
        - If text exists in the image, extract it.
        - If charts or tables exist, explain them.
        - If something is unclear, say so.
        - Use Markdown when helpful.
        - Do not hallucinate.`
      ),
      new HumanMessage({
        content: [
          {
            type: "text",
            text: state.prompt || "analyze the image",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`
            }
          }
        ]
      })
    ];

    const response = await llm.invoke(messages);

    const { credits } = await deductCredits(state?.userId, "imageAnalyzer");

    return {
      ...state,
      aiResponse: response?.content,
      remainingCredits: credits,
    }
  } catch (error) {
    logToFile("Image Analyzer agent error", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      code: error?.code,
      status: error?.response?.status,
      responseData: error?.response?.data,
      config: error?.config ? { url: error.config.url, method: error.config.method } : undefined,
      data: error?.data || "(empty)",
    });
    return {
      ...state,
      aiResponse: error?.response?.data?.message || error?.data?.message || "❌ Failed to analyze file.",
    }
  } finally {
    await fs.unlink(state?.file?.path);
  }
};