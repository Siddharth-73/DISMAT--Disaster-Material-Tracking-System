import mongoose from "mongoose";
import initRootSuperAdmin from "../utils/initRootSuperAdmin.js";
import initDisasterCategories from "../utils/initDisasterCategories.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    await initRootSuperAdmin();
    await initDisasterCategories();

  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;
