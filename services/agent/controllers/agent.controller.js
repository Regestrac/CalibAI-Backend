import axios from 'axios';
import { graph } from '../graph/graph.js';

export const agent = async (req, res) => {
  try {
    const { prompt, conversationId } = req.body;

    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      content: prompt,
      role: "user",
    });

    const result = await graph.invoke({
      prompt,
      conversationId,
    });

    const response = result.aiResponse;

    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      content: response,
      role: "assistant",
    });

    return res.status(200).json({ message: "Agent response", data: response });

  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: "Agent error: " + error.message,
    });
  }
};