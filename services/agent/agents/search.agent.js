import { searchTool } from "../config/tavliy.js";
import { deductCredits } from "../utils/deductCredits.js";

export const searchAgent = async (state) => {
  try {
    const results = await searchTool.invoke({ query: state?.prompt });

    await deductCredits(state?.userId, "search");

    return {
      ...state,
      searchResults: results,
      images: results?.images,
    }
  } catch (error) {
    console.log("Search Error: ", error);
    return {
      ...state,
      searchResults: [],
      images: [],
    }
  }
};