import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "./embeddings.js";

export const vectorStore = async (docs, collectionName) => {
  return await QdrantVectorStore.fromExistingCollection(docs, embeddings, {
    url: process.env.QDRANT_URL,
    collectionName,
  });
};