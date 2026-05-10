import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn("MongoDB skipped: MONGO_URI is not set.");
    return null;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB connected.");
    return mongoose.connection;
  } catch (error) {
    console.warn("MongoDB connection failed:", error.message);
    return null;
  }
};

export default connectDB;
