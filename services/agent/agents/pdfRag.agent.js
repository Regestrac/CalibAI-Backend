import fs from 'fs';
import { PDFParse } from 'pdf-parse'
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { vectorStore } from '../config/vectorDb.js';
import { getModel } from '../config/llmModels.js';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { checkCredits } from '../utils/checkCredits.js';
import { deductCredits } from '../utils/deductCredits.js';
import { checkAgentLimit } from '../config/agentLimit.js';

const PAGE_SEPARATOR_REGEX = /^--\s*\d+\s*of\s*\d+\s*--$/;

const isPageSeparator = (text) => PAGE_SEPARATOR_REGEX.test(text.trim());

const parseName = (path) => {
  const splitPath = path.split("\\");
  const fileName = splitPath?.at(-1)?.replaceAll(" ", "-");

  const dotIndex = fileName?.lastIndexOf(".");

  return dotIndex !== -1 ? fileName?.slice(0, dotIndex) : fileName;
}

export const pdfRagAgent = async (state) => {
  try {
    await checkAgentLimit(state.userId, "pdfRag");
    await checkCredits(state.userId, "pdfRag");

    const buffer = fs.readFileSync(state.file.path);

    const pdf = new PDFParse({ data: buffer });
    const result = await pdf.getText();
    const text = result.text;

    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 100 });
    const rawDocs = await splitter.createDocuments([text]);

    const docs = rawDocs.filter((doc) => {
      const content = doc.pageContent.trim();
      if (isPageSeparator(content)) return false;
      if (content.length < 20) return false;
      return true;
    });

    if (docs.length === 0) {
      return {
        ...state,
        aiResponse: "I couldn't extract meaningful content from the uploaded PDF.",
      };
    }

    const collectionName = `pdf-${parseName(state.file.originalname)}-${Date.now()}`;
    const store = await vectorStore(docs, collectionName);
    const relevantDocs = await store.similaritySearchWithScore(state?.prompt, 10);

    const filteredDocs = relevantDocs.filter(([doc, score]) => {
      const content = doc.pageContent.trim();
      if (isPageSeparator(content)) return false;
      if (content.length < 20) return false;
      if (score < 0.5) return false;
      return true;
    }).sort((a, b) => b[1] - a[1]).slice(0, 3);

    const context = filteredDocs.map(([doc, _score], i) => doc.pageContent).join("\n\n");

    if (!context || context.trim().length === 0) {
      return {
        ...state,
        aiResponse: "I couldn't find relevant information in the uploaded PDF for your question.",
      };
    }

    const llm = await getModel("pdfRag");

    const messages = [
      new SystemMessage(
        `You are CalibAI PDF assistant.
        
        Rules:
        - Answer ONLY for the uploaded PDF.
        - Never make up information.
        - If the answer is not present in the PDF, reply: "I couldn't find this information in the uploaded PDF".
        - Use markdown formatting
        
        The relevant content of the pdf is given as "Context" to you with the human message. Give response based on it.`
      ),
      new HumanMessage(
        `Context: ${context}

        Question: ${state.prompt}`
      ),
    ];

    const response = await llm.invoke(messages);

    await deductCredits(state.userId, "pdfRag");

    return {
      ...state,
      aiResponse: response?.content,
    };
  } catch (error) {
    return {
      ...state,
      aiResponse: error?.response?.data?.message || error?.data?.message || '❌ Failed to analyze PDF',
    };
  } finally {
    fs.unlinkSync(state.file.path);
  }
};