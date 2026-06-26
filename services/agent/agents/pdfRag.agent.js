import fs from 'fs';
import { PDFParse } from 'pdf-parse'
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { vectorStore } from '../config/vectorDb.js';
import { getModel } from '../config/llmModels.js';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { deductCredits } from '../utils/deductCredits.js';

export const pdfRagAgent = async (state) => {
  try {
    const buffer = fs.readFileSync(state.file.path);

    const pdf = new PDFParse({ data: buffer });
    const result = await pdf.getText();
    const text = result.text;

    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    const docs = await splitter.createDocuments([text]);

    const collectionName = `pdf-${Date.now()}`;

    const store = await vectorStore(docs, collectionName);

    const relevantDocs = await store.similaritySearch(state?.prompt, 5);

    const context = relevantDocs.map((doc) => doc.pageContent).join("\n\n");

    const llm = await getModel("pdfRag");

    const messages = [
      new SystemMessage(
        `You are CalibAI PDF assistant.
        
        Rules:
        - Answer ONLY for the uploaded PDF.
        - Never make up information.
        - If the answer is not present in the PDF, reply: "I couldn't find this information in the uploaded PDF".
        - Use markdown formatting`
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
    console.log(error);

    return {
      ...state,
      aiResponse: '❌ Failed to analyze PDF',
    };
  } finally {
    fs.unlinkSync(state.file.path);
  }
};