import crypto from 'node:crypto';
import { getAuth } from 'firebase-admin/auth';
import { app } from '../config/firebase.js';
import User from '../models/user.model.js';
import redis from '../../../shared/redis/redis.js';

export const login = async (req, res) => {
  try {
    const { token } = req.body;
    const auth = getAuth(app);

    const decodedToken = await auth.verifyIdToken(token);
    let user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      user = await User.create({
        firebaseUid: decodedToken.uid,
        name: decodedToken.name,
        email: decodedToken.email,
        avatarUrl: decodedToken.picture,
      });
    }

    const sessionId = crypto.randomUUID();
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

    res.cookie("session", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user,
    });

  } catch (error) {
    console.log(`Login error: ${error}`);
    return res.status(500).json({ message: `Login error: ${error}` });
  }
}

export const logout = async (req, res) => {
  try {
    const sessionId = req.cookies.session;

    await redis.del(`session-${sessionId}`);
    res.clearCookie("session");

    res.status(200).json({ message: "Logged out successfully." })
  } catch (error) {
    console.log(`Login error: ${error}`);
    return res.status(500).json({ message: `Logout error: ${error}` });
  }
}