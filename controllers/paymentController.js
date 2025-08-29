import razorpay from "../config/razopay.js";
import crypto from "crypto";
import Order from "../models/Order.js";
import sendEmail from "../utils/sendEmail.js";


//Init razorpay


// Create Razorpay Order
export const createOrder = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const options = {
      amount: 50000, // amount in paise (50000 = ₹500)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Save initial details to DB
    const newOrder = new Order({
      name,
      email,
      phone,
      razorpayOrderId: order.id,
      amount: options.amount / 100,
    });
    await newOrder.save();

    res.json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Verify Payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpaySignature) {
      const order = await Order.findOne({ razorpayOrderId });
      if (order) {
        order.razorpayPaymentId = razorpayPaymentId;
        order.razorpaySignature = razorpaySignature;
        order.status = "paid";
        await order.save();

        // Send email to admin
        const message = `
        ✅ New Course Purchase
        -------------------------
        Name: ${order.name}
        Email: ${order.email}
        Phone: ${order.phone}
        Amount: ₹${order.amount}
        Payment ID: ${razorpayPaymentId}
        Time: ${new Date().toLocaleString()}
        `;

        await sendEmail("New Course Purchase", message, process.env.ADMIN_EMAIL);

        return res.json({ success: true, message: "Payment verified successfully" });
      }
    } else {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};




// Razorpay Webhook
export const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (signature !== digest) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    const event = req.body.event;

    if (event === "payment.captured") {
      const payment = req.body.payload.payment.entity;

      // Find order by Razorpay order_id
      const order = await Order.findOne({ razorpayOrderId: payment.order_id });

      if (order) {
        order.razorpayPaymentId = payment.id;
        order.status = "paid";
        await order.save();

        // Send email to admin
        const message = `
        ✅ New Course Purchase (via Webhook)
        -------------------------
        Name: ${order.name}
        Email: ${order.email}
        Phone: ${order.phone}
        Amount: ₹${order.amount}
        Payment ID: ${payment.id}
        Time: ${new Date().toLocaleString()}
        `;

        await sendEmail("New Course Purchase (Webhook)", message, process.env.ADMIN_EMAIL);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ success: false });
  }
};
