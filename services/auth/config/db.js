import mongoose from "mongoose"

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("Auth DB connected");
  } catch (error) {
    console.log(`DB error: ${error}`);
  }
}

export default connectDB;