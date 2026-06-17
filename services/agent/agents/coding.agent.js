import { getModel } from "../config/llmModels"

export const codingAgent = async (state) => {
  const intentLlm = await getModel("intent");
  const codingLlm = await getModel("coding");

  const intentResponse = await intentLlm.invoke(`
    You are an intent classifier.
    
    Return ONLY one of these values:
    CODE_GENERATION
    CODE_REVIEW
    CODE_EXPLANATION
    DEBUGGING
    OPTIMIZATION
    CONVERSION
    DOCUMENTATION

    User Request: ${state?.prompt}
  `);

  const intent = intentResponse?.content;

  if (intent = "CODE_GENERATION") {
    const prompt = `
      You are a coding agent of CalibAI.
      Generate the requested project.

      Default stack: HTML, CSS, JavaScript.

      Use any other stack ONLY if explicitly requested.

      Rules: Responsive, Modern UI, CSS Variables, Flexbox/Grid, Smooth Scroll, Hover Effects, Beautiful Spacing, Single page unless user asks otherwise.

      Return ONLY valid JSON.
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

      Rules: No markdown, No explanation, No extra text or symbols, Never mention intent

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