import fs from "fs";
import { getModel } from "../config/llmModels.js"
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export const imageAnalyzerAgent = async (state) => {
  try {
    const llm = await getModel("imageAnalyzer");

    const imageBuffer = await fs.readFileSync(state?.file?.path);
    const base64Image = await imageBuffer.toString("base64");
    const mimeType = state?.file?.mimeType;

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

    return {
      ...state,
      aiResponse: response?.content,
    }
  } catch (error) {
    console.log("Image analyzer error: ", error);
    return {
      ...state,
      aiResponse: "❌ Failed to analyze file.",
    }
  } finally {
    fs.unlink(state?.file?.path);
  }
};