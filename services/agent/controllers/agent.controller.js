import axios from 'axios';
import { graph } from '../graph/graph.js';
import { updateMemory } from '../config/memory.js';

export const agent = async (req, res) => {
  try {
    const { prompt, conversationId, agent } = req.body;
    const userId = req?.headers?.['x-user-id'] || '';

    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      content: prompt,
      role: "user",
    });

    const result = await graph.invoke({
      prompt,
      conversationId,
      agent,
      userId,
    });

    await updateMemory(conversationId, "user", prompt);
    await updateMemory(conversationId, "assistant", result?.aiResponse);

    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      content: result?.aiResponse,
      role: "assistant",
      images: result?.images,
      artifacts: result?.artifacts,
    });

    return res.status(200).json({
      message: "Agent response",
      data: result?.aiResponse,
      images: result?.images,
      artifacts: result?.artifacts,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: "Agent error: " + error.message,
    });
  }
};