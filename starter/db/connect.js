import mongoose from "mongoose";

const connectDB = async (url) => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB", error.name, error.code || "");
    process.exit(1); // Exit the process if connection fails
  }
};

export default connectDB;
