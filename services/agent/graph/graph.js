import { StateGraph } from "@langchain/langgraph";
import { agentState } from "./state.js";
import { router } from "./router.js";
import { chatAgent } from "../agents/chat.agent.js";
import { codingAgent } from "../agents/coding.agent.js";
import { searchAgent } from "../agents/search.agent.js";
import { imageAgent } from "../agents/image.agent.js";
import { pdfAgent } from "../agents/pdf.agent.js";
import { pptAgent } from "../agents/ppt.agent.js";
import { pdfRagAgent } from "../agents/pdfRag.agent.js";
import { imageAnalyzerAgent } from "../agents/imageAnalyzer.agent.js";

const workflow = new StateGraph(agentState);

workflow.addNode("router", router);
workflow.addNode("chat", chatAgent);
workflow.addNode("coding", codingAgent);
workflow.addNode("search", searchAgent);
workflow.addNode("image", imageAgent);
workflow.addNode("pdf", pdfAgent);
workflow.addNode("ppt", pptAgent);
workflow.addNode("pdfRag", pdfRagAgent);
workflow.addNode("imageAnalyzer", imageAnalyzerAgent);

workflow.addEdge("__start__", "router");

workflow.addConditionalEdges(
  "router",
  (state) => {
    return state.agent || "chat";
  },
  {
    chat: "chat",
    coding: "coding",
    search: "search",
    image: "image",
    pdf: "pdf",
    ppt: "ppt",
    pdfRag: "pdfRag",
    imageAnalyzer: "imageAnalyzer",
  },
);

workflow.addEdge("search", "chat");
workflow.addEdge("chat", "__end__");
workflow.addEdge("coding", "__end__");
workflow.addEdge("image", "__end__");
workflow.addEdge("pdf", "__end__");
workflow.addEdge("ppt", "__end__");
workflow.addEdge("pdfRag", "__end__");
workflow.addEdge("imageAnalyzer", "__end__");

export const graph = workflow.compile();