import { checkAgentLimit } from "../config/agentLimit.js";
import { getModel } from "../config/llmModels.js"
import { checkCredits } from "../utils/checkCredits.js";
import { deductCredits } from "../utils/deductCredits.js";
import { logToFile } from "../utils/logToFile.js";

export const codingAgent = async (state) => {
  try {
    await checkAgentLimit(state.userId, "coding");
    await checkCredits(state?.userId, "coding");

    const intentLlm = await getModel("intent");
    const codingLlm = await getModel("coding");

    const intentResponse = await intentLlm.invoke(`
      You are an intent classifier. Your sole responsibility is to analyze the user's request and classify it into exactly one of the following categories:

      - CODE_GENERATION
      - CODE_REVIEW
      - CODE_EXPLANATION
      - DEBUGGING
      - OPTIMIZATION
      - CONVERSION
      - DOCUMENTATION

      CRITICAL INSTRUCTIONS:
      1. Output ONLY the category name in ALL CAPS
      2. Do NOT include any additional text, explanations, punctuation, or formatting
      3. Do NOT prefix with "Intent:" or any other label
      4. Do NOT wrap in quotes or backticks
      5. Do NOT provide reasoning or thought process
      6. Your response must consist of a single word from the list above and nothing else

      User Request: ${state?.prompt}
    `);

    const intent = intentResponse?.content?.trim();

    if (intent === "CODE_GENERATION" || intent.includes("CODE_GENERATION")) {
      const prompt = `
        You are a coding agent of CalibAI.
        Generate the requested project.

        Default stack: HTML, CSS, JavaScript.

        Use any other stack ONLY if explicitly requested.

        Rules: Responsive, Modern UI, CSS Variables, Flexbox/Grid, Smooth Scroll, Hover Effects, Beautiful Spacing, Single page unless user asks otherwise.

        CRITICAL OUTPUT INSTRUCTIONS:
        1. Return ONLY raw JSON - no markdown, no code blocks, no backticks, no explanations
        2. Do NOT wrap the response in \`\`\`json or \`\`\` or any other formatting
        3. The response must start with { and end with }
        4. All property names and string values must use double quotes
        5. Escape any double quotes inside strings with \\"
        6. No trailing commas
        7. No comments in the JSON
        8. The entire response must be valid JSON that can be parsed with JSON.parse()

        Schema: 
        {
          "files":[
            {
              "name": "index.html",
              "content": "..."
            },
            {
              "name": "style.css",
              "content": "..."
            },
            {
              "name": "script.js",
              "content": "..."
            }
          ]
        }

        REMEMBER: Your response must be PURE JSON. Nothing else. No text before or after. No markdown formatting. No explanation. Just the JSON object.

        User Request: ${state?.prompt}
      `;

      const response = await codingLlm.invoke(prompt);
      const content = JSON.parse(response?.content);

      const { credits } = await deductCredits(state?.userId, "coding");

      return {
        ...state,
        aiResponse: "Code generated succesfully",
        remainingCredits: credits,
        artifacts: [
          {
            id: Date.now(),
            type: "Project",
            title: state?.prompt,
            files: content?.files || [],
          }
        ]
      };
    }

    const response = await codingLlm.invoke(`
      The user's request is: ${intent}.
      
      Return markdown only.
      Never generate project files.
      Use headings like:
      # Overview
      ## Explanation
      ## Problems
      ## Improvements
      ## Best Practices
      ## Optimized code (if needed)

      User Request: ${state?.prompt}
    `);

    const { credits } = await deductCredits(state?.userId, "coding");

    return {
      ...state,
      aiResponse: response?.content,
      remainingCredits: credits,
      artifacts: [],
    }
  } catch (error) {
    logToFile("Coding agent error", {
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
      aiResponse: error?.response?.data?.message || error?.data?.message || `❌ Failed to generate response.`,
      artifacts: [],
    }
  }
}