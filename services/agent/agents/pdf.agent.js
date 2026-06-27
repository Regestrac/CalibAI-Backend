import { getModel } from "../config/llmModels.js"
import { generatePdf } from "../utils/generatePdf.js";
import { getFromB2 } from "../utils/getFromB2.js";
import { uploadToB2 } from "../utils/uploadToB2.js";
import { deductCredits } from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimit.js";

export const pdfAgent = async (state) => {
  try {
    await checkAgentLimit(state.userId, "pdf");

    const llm = await getModel("pdf");

    const prompt = `
      You are an expert document writer.
      Return ONLY valid JSON.
      Do NOT return markdown.
      Do NOT return explanations.

      Structure:
      {
      "title":"".
      "subtitle":,
      "sections":[
          {
            "heading":"",
            "points":[]
          }
        ]
      }

      Generate 4-8 sections.
      Each section should have 3-6 concise bullet points.
      Topic for content is based on user request.

      User request: ${state?.prompt}
    `;

    const res = await llm.invoke(prompt);
    const data = JSON.parse(res?.content);

    const pdfBuffer = await generatePdf(data);

    const fileName = `pdf-${Date.now()}.pdf`;

    await uploadToB2(fileName, pdfBuffer, "application/pdf");
    const downloadUrl = await getFromB2(fileName, 24 * 60 * 60);

    await deductCredits(state?.userId, "pdf");

    return {
      ...state,
      aiResponse: `# 📄 PDF Generated Successfully
      
      **${data?.title}**
      
      You can download the PDF using the link below.
      
      🔗 [Download PDF](${downloadUrl})
      
      ⏳ _Link expires in 24 hours._`.replaceAll("\n      \n     ", "\n\n"),
    }
  } catch (error) {
    console.log("PDF agent error: ", error);
    return {
      ...state,
      aiResponse: error?.data?.message || "❌ Failed to generate PDF.",
    }
  }
}