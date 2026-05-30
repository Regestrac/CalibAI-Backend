import mongoose from "mongoose"

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("Chat DB connected");
  } catch (error) {
    console.log(`Chat DB error: ${error}`);
  }
}

export default connectDB;