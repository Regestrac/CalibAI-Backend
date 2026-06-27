import { checkAgentLimit } from "../config/agentLimit.js";
import { searchTool } from "../config/tavliy.js";
import { checkCredits } from "../utils/checkCredits.js";
import { deductCredits } from "../utils/deductCredits.js";

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
    return {
      ...state,
      searchResults: [],
      images: [],
      aiResponse: error?.response?.data?.message || error?.data?.message || "❌ Failed to get search results."
    }
  }
};