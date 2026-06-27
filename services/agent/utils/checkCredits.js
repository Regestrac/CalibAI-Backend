import axios from "axios";

export const checkCredits = async (userId, agent) => {
  const { data } = await axios.post(`${process.env.AUTH_SERVICE}/check-credits`, { userId, agent });

  return data;
}
