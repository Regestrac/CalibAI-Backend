import { StateGraph } from "@langchain/langgraph";
import { agentState } from "./state";
import { router } from "./router";

const workflow = StateGraph(agentState);

workflow.addNode("router", router);
workflow.addNode("chat", chatAgent);
workflow.addNode("search", searchAgent);
workflow.addNode("imageGen", imageGenAgent);
workflow.addNode("pdf", pdfAgent);
workflow.addNode("ppt", pptAgent);

workflow.addEdge("__start__", "router");
workflow.addConditionalEdges("router", router);