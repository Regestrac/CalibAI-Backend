import { StateGraph } from "@langchain/langgraph";
import { agentState } from "./state";
import { router } from "./router";
import { chatAgent } from "../agents/chat.agent";
import { codingAgent } from "../agents/coding.agent";
import { searchAgent } from "../agents/search.agent";
import { imageAgent } from "../agents/image.agent";
import { pdfAgent } from "../agents/pdf.agent";
import { pptAgent } from "../agents/ppt.agent";

const workflow = StateGraph(agentState);

workflow.addNode("router", router);
workflow.addNode("chat", chatAgent);
workflow.addNode("coding", codingAgent);
workflow.addNode("search", searchAgent);
workflow.addNode("image", imageAgent);
workflow.addNode("pdf", pdfAgent);
workflow.addNode("ppt", pptAgent);

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
  },
);