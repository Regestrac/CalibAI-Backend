import crypto from 'node:crypto';
import { getAuth } from 'firebase-admin/auth';
import { app } from '../config/firebase.js';
import User from '../models/user.model.js';
import redis from '../../../shared/redis/redis.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const login = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Authentication token is required." });
    }

    const auth = getAuth(app);
    let decodedToken;

    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (err) {
      console.error("Firebase token verification failed:", err.message);
      return res.status(401).json({ message: "Invalid or expired authentication token." });
    }

    let user;
    try {
      user = await User.findOne({ firebaseUid: decodedToken.uid });

      if (!user) {
        user = await User.create({
          firebaseUid: decodedToken.uid,
          name: decodedToken.name,
          email: decodedToken.email,
          avatarUrl: decodedToken.picture,
        });
      }
    } catch (err) {
      console.error("Database error during login:", err.message);
      return res.status(500).json({ message: "Failed to process user data. Please try again." });
    }

    const sessionId = crypto.randomUUID();
    try {
      await redis.set(
        `session-${sessionId}`,
        JSON.stringify({
          userId: user._id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        }),
        'EX',
        60 * 60 * 24 * 7
      );
    } catch (err) {
      console.error("Redis session error:", err.message);
      return res.status(500).json({ message: "Failed to create session. Please try again." });
    }

    res.cookie("session", sessionId, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user,
    });

  } catch (error) {
    console.error("Unexpected login error:", error);
    return res.status(500).json({ message: "An unexpected error occurred during login. Please try again." });
  }
}

export const logout = async (req, res) => {
  try {
    const sessionId = req?.cookies?.session;

    if (sessionId) {
      await redis.del(`session-${sessionId}`);
    }

    res.clearCookie("session", { path: "/" });

    res.status(200).json({ message: "Logged out successfully." })
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Failed to log out. Please try again." });
  }
};

export const updateUserPayment = async (req, res) => {
  try {
    const { plan, credits, userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.plan = plan;
    user.credits += credits;
    user.totalCredits += credits;
    user.planExpiresAt = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));

    await user.save();

    const sessionId = req.cookies?.session;
    await redis.set(
      `session-${sessionId}`,
      JSON.stringify({
        userId: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
        credits: user.credits,
        totalCredits: user.totalCredits,
        planExpiresAt: user.planExpiresAt,
      }),
      'EX',
      60 * 60 * 24 * 7
    );

    return res.status(200).json({ message: "Payment updated successfully." });
  } catch (error) {
    console.error("Payment update error:", error);
    return res.status(500).json({ message: "Failed to update payment. Please try again." });
  }
};