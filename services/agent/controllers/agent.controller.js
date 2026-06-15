import axios from 'axios';
import { graph } from '../graph/graph.js';
import { updateMemory } from '../config/memory.js';

export const agent = async (req, res) => {
  try {
    const { prompt, conversationId, agent } = req.body;

    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      content: prompt,
      role: "user",
    });

    const result = await graph.invoke({
      prompt,
      conversationId,
      agent,
    });

    const response = result?.aiResponse;

    await updateMemory(conversationId, "user", prompt);
    await updateMemory(conversationId, "assistant", response);

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