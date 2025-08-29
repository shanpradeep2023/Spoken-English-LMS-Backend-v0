import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";
import paymentRoutes from "./routes/paymentRoutes.js";


dotenv.config();
connectDB();

const app = express();
app.use(cors());

console.log("Razorpay Key ID:", process.env.RAZORPAY_KEY_ID);

//  Special middleware for Razorpay Webhook
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

// Normal JSON parser for all other routes
app.use(bodyParser.json());

// Routes
app.use("/api/payment", paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
