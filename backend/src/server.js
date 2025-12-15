import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import materialRoutes from "./routes/materialRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import dispatchRoutes from "./routes/dispatchRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/dispatch", dispatchRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/public", publicRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
