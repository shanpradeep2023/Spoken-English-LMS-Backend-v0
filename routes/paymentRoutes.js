import express from "express";
import { createOrder, verifyPayment, razorpayWebhook } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/order", createOrder);     // Create Razorpay order
router.post("/verify", verifyPayment);  // Manual verify (frontend)
router.post("/webhook", razorpayWebhook); // Razorpay webhook

export default router;
