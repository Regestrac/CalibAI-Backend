import redis from "../../../shared/redis/redis.js";

const limits = {
  chat: 20,
  coding: 5,
  pdf: 5,
  ppt: 5,
  image: 10,
  search: 5,
  pdfRag: 3,
  imageAnalyzer: 3,
};

const agentLable = {
  chat: "Chat",
  coding: "Coding Agent",
  pdf: "PDF Generation",
  ppt: "PPT Generation",
  image: "Image Generation",
  search: "Web Search",
  pdfRag: "PDF Analyzing",
  imageAnalyzer: "Image Analyzing",
};

export const checkAgentLimit = async (userId, agent) => {
  const max = limits[agent] || limits?.chat;
  const key = `rate:${userId}:${agent}`;

  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 60);
  }

  const ttl = await redis.ttl(key);

  if (count > max) {
    const minutes = Math.floor(ttl / 60);
    const seconds = ttl % 60;
    const time = minutes > 0 ? `${minutes}m : ${seconds}s` : `${seconds}s`;

    const error = new Error(`Rate limit exceeded for ${agentLable[agent] || "the model"}.`)
    error.status = 429;
    error.data = {
      success: false,
      agent,
      limit: max,
      remainingTime: ttl,
      retryAfter: time,
      message: `You have reached the ${agentLable[agent]} limit (${max} requests/minute). Try again in ${time}.`
    }
    throw error;
  }

  return {
    remaining: max - count,
    limit: max,
  }
};