import { searchTool } from "../config/tavliy.js";

export const searchAgent = async (state) => {
  try {
    const results = await searchTool.invoke({ query: state?.prompt });

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