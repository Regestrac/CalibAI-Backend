import { getModel } from "../config/llmModels.js"
import { generatePpt } from "../utils/generatePpt.js";
import { getFromB2 } from "../utils/getFromB2.js";
import { uploadToB2 } from "../utils/uploadToB2.js";
import { deductCredits } from "../utils/deductCredits.js";

export const pptAgent = async (state) => {
  try {
    const llm = await getModel("ppt");

    const prompt = `
      You are a professional presentation designer.

      Format:
      {
        "title":"",
        "subtitle":"",
        "slides":[
          {
            "title":"",
            "points":["","",""]
          }
        ]
      }

      Rules:
      - Generate exactly 6 content slides.
      - Each slide should have 4-6 concise bullet points.
      - No markdown.
      - No explanation or reasoning.
      - No code block.
      - Return ONLY JSON.

      Topic for content is based on user request.
      User request: ${state?.prompt}
    `;

    const res = await llm.invoke(prompt);
    const data = JSON.parse(res?.content);

    const ppt = await generatePpt(data);
    const buffer = await ppt.write({ outputType: "nodebuffer" });
    const fileName = `ppt-${Date.now()}.pptx`;

    await uploadToB2(fileName, buffer, "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    const downloadUrl = await getFromB2(fileName, 24 * 60 * 60);

    await deductCredits(state?.userId, "ppt");

    return {
      ...state,
      aiResponse: `# 📄 PPT Generated Successfully
      
      **${data?.title}**
      
      You can download the PPT using the link below.
      
      🔗 [Download PPT](${downloadUrl})
      
      ⏳ _Link expires in 24 hours._`.replaceAll("\n      \n     ", "\n\n"),
    }
  } catch (error) {
    console.log("PPT agent error: ", error)
    return {
      ...state,
      aiResponse: '❌ Failed to generate PPT.'
    }
  }
}