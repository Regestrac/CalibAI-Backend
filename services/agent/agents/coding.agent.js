import { getModel } from "../config/llmModels.js"

export const codingAgent = async (state) => {
  const intentLlm = await getModel("intent");
  const codingLlm = await getModel("coding");

  const intentResponse = await intentLlm.invoke(`
    You are an intent classifier.
    
    Return ONLY one of these values without any explanation, thought process or extra text:
    - CODE_GENERATION
    - CODE_REVIEW
    - CODE_EXPLANATION
    - DEBUGGING
    - OPTIMIZATION
    - CONVERSION
    - DOCUMENTATION

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

    return {
      ...state,
      aiResponse: "Code generated succesfully",
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

  return {
    ...state,
    aiResponse: response?.content,
    artifacts: [],
  }
}