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