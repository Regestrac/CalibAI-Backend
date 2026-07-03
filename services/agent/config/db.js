import mongoose from "mongoose"
import { logError } from "../utils/logError.js"

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("Agent DB connected");
  } catch (error) {
    logError("Agent DB connection error", error);
  }
}

export default connectDB;