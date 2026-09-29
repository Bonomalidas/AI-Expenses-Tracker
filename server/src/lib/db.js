// Connects to MongoDB using Mongoose. Called once when the server starts.
import mongoose from "mongoose";
import "dotenv/config";

export async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected.");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1); // stop the server if we can't connect to the DB
  }
}