import redis from "../../shared/redis/redis.js";

const protect = async (req, res, next) => {
  try {
    const sessionId = req?.cookies?.session;
    if (!sessionId) {
      return res.status(401).json({ message: "Authentication required. Please log in." });
    }

    const session = await redis.get(`session-${sessionId}`);
    if (!session) {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }

    req.user = JSON.parse(session);
    next()
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: "Authentication error. Please try again." });
  }
};

export default protect;