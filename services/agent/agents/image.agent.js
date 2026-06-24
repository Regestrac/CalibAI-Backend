import axios from "axios";
import { getModel } from "../config/llmModels.js"
import { uploadToB2 } from "../utils/uploadToB2.js";
import { getFromB2 } from "../utils/getFromB2.js";
import { deductCredits } from "../utils/deductCredits.js";

export const imageAgent = async (state) => {
  try {
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

    await deductCredits(state?.userId, "image");

    return {
      ...state,
      aiResponse: `# 🖼️ Image Generated Successfully
      
      ![Generated Image](${downloadUrl})
      
      🔗 [Download Image](${downloadUrl})
      
      ⏳ Link expires in 24 hours.`.replaceAll("\n      \n      ", "\n\n"),
    }
  } catch (error) {
    console.log("Error:", error);
    return {
      ...state,
      aiResponse: `❌ Failed to generate image.`,
    }
  }
}