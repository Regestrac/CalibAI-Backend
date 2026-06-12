import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const createConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    console.log('userId: ', userId);

    const conversation = await Conversation.create({
      userId,
    });

    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({ message: `Create conversation error: ${error}` });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    const conversations = await Conversation.find({
      userId,
    }).sort({ updatedAt: -1 });

    return res.status(200).json(conversations);
  } catch (error) {
    return res.status(500).json({ message: `Get conversations error: ${error}` });
  }
};

export const updateConversation = async (req, res) => {
  try {
    const { id, title } = req.body;

    const conversation = await Conversation.findByIdAndUpdate(id, { title });

    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({ message: `Update conversation error: ${error}` });
  }
};

export const saveMessage = async (req, res) => {
  try {
    const { conversationId, role, content } = req.body;

    const message = await Message.create({
      conversationId,
      role,
      content
    });

    return res.status(200).json(message);
  } catch (error) {
    return res.status(500).json({ message: `Save message error: ${error}` });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).sort({ createdAt: -1 });

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: `Get messages error: ${error}` });
  }
};