import axios from "axios";
import { logError } from "./logError.js";

export const getMessages = async (conversationId) => {
  try {
    const { data } = await axios.get(`${process.env.CHAT_SERVICE}/get-messages/${conversationId}`);

    return data;
  } catch (error) {
    logError("Get messages error", error, { conversationId });
    return null;
  }
}