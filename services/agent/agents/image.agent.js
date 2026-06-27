import axios from "axios";
import { getModel } from "../config/llmModels.js"
import { uploadToB2 } from "../utils/uploadToB2.js";
import { getFromB2 } from "../utils/getFromB2.js";
import { checkCredits } from "../utils/checkCredits.js";
import { deductCredits } from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimit.js";
import { logToFile } from "../utils/logToFile.js";

export const imageAgent = async (state) => {
  try {
    await checkAgentLimit(state.userId, "image");
    await checkCredits(state?.userId, "image");

    const llm = await getModel("image");
    const res = await llm.invoke(`
      You are a elite AI image prompt engineer.
      
      Convert the user query into a highly detailed image generation prompt.

      Requirements:
      - Cinematic lighting
      - Professional composition
      - Ultra realistic
      - Beautiful color pallet
      - Sharp focus
      - 8K quality
      - Photorealistic
      - Depth of field
      - Professional photography
      - Stunning visuals
      - PNG image

      Return ONLY the image prompt.

      User request: ${state?.prompt}
    `);

    const prompt = res?.content?.trim();

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

    const imgaeResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

    const buffer = Buffer.from(imgaeResponse?.data);
    const fileName = `calib-ai-${Date.now()}.png`;

    await uploadToB2(fileName, buffer, "image/png");
    const downloadUrl = await getFromB2(fileName, 24 * 60 * 60);

    const { credits } = await deductCredits(state?.userId, "image");

    return {
      ...state,
      aiResponse: `# 🖼️ Image Generated Successfully
      
      ![Generated Image](${downloadUrl})
      
      🔗 [Download Image](${downloadUrl})
      
      ⏳ Link expires in 24 hours.`.replaceAll("\n      \n      ", "\n\n"),
      remainingCredits: credits,
    }
  } catch (error) {
    logToFile("Image agent error", {
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
      aiResponse: error?.response?.data?.message || error?.data?.message || `❌ Failed to generate image.`,
    }
  }
}