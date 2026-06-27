import { checkAgentLimit } from "../config/agentLimit.js";
import { searchTool } from "../config/tavliy.js";
import { checkCredits } from "../utils/checkCredits.js";
import { deductCredits } from "../utils/deductCredits.js";
import { logToFile } from "../utils/logToFile.js";

export const searchAgent = async (state) => {
  try {
    await checkAgentLimit(state.userId, "search");
    await checkCredits(state?.userId, "search");

    const results = await searchTool.invoke({ query: state?.prompt });

    const { credits } = await deductCredits(state?.userId, "search");

    return {
      ...state,
      searchResults: results,
      images: results?.images,
      remainingCredits: credits,
    }
  } catch (error) {
    logToFile("Search agent error", {
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
      searchResults: [],
      images: [],
      aiResponse: error?.response?.data?.message || error?.data?.message || "❌ Failed to get search results."
    }
  }
};