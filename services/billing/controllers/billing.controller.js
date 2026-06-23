import axios from "axios";
import { PLANS } from "../config/plans.js";
import razorpay from "../config/razorpay.js";
import Payment from "../models/payment.model.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req?.headers?.["x-user-id"];
    const { plan } = req.body;

    const selectedPlan = PLANS[plan];
    if (!selectedPlan) {
      res.status(404).json({ message: "Plan not found." })
    }

    const order = await razorpay.orders.create({
      amount: selectedPlan.amount * 100,
      currency: "INR",
      receipt: `reciept-${Date.now()}`,
    })

    await Payment.create({
      userId,
      orderId: order.id,
      plan: selectedPlan.id,
      amount: selectedPlan.amount,
      credits: selectedPlan.credits,
      currency: order.currency,
      status: "created",
    });

    return res.status(200).json({ order, plan: selectedPlan })
  } catch (error) {
    return res.status(500).json({ message: `Create order error: ${error}` })
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const generateSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");

    if (generateSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment." });
    }

    const payment = await Payment.findOne({ orderId: razorpay_order_id });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    payment.status = "paid";
    payment.paymentId = razorpay_payment_id;

    await payment.save();

    await axios.post(`${process.env.AUTH_SERVICE}/update-plan`, { userId: payment.userId, plan: payment.plan, credits: payment.credits });

    return res.status(200).json({ message: "Payment verified" });
  } catch (error) {
    return res.status(500).json({ message: `Payment verification error: ${error}` })
  }
}
