import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    amount: Number,
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
