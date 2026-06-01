import mongoose from "mongoose"

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("Agent DB connected");
  } catch (error) {
    console.log(`Agent DB error: ${error}`);
  }
}

export default connectDB;