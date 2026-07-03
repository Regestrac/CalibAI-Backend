import mongoose from "mongoose"
import { logError } from "../utils/logError.js"

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("Auth DB connected");
  } catch (error) {
    logError("Auth DB connection error", error);
  }
}

export default connectDB;