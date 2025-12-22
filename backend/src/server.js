import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import materialRoutes from "./routes/materialRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import dispatchRoutes from "./routes/dispatchRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import warehouseRoutes from "./routes/warehouseRoutes.js";
import disasterCategoryRoutes from "./routes/disasterCategoryRoutes.js";
import disasterZoneRoutes from "./routes/disasterZoneRoutes.js";
import { syncEONET } from "./jobs/syncEONET.js";
import { syncUSGS } from "./jobs/syncUSGS.js";




dotenv.config();

const app = express();

// Connect DB (handles init logic internally)
connectDB();
await syncUSGS();
await syncEONET();
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/dispatch", dispatchRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/disaster-categories", disasterCategoryRoutes);
app.use("/api/disaster-zones", disasterZoneRoutes);

app.use("/api/analytics", (await import("./routes/analyticsRoutes.js")).default);
app.use("/api/users", (await import("./routes/userRoutes.js")).default);

mongoose.connection.once("open", async () => {
  await syncEONET();
  await syncUSGS();

});
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
