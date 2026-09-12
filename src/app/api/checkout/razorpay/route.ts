import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If Razorpay keys are not configured, return test mock order
    if (!keyId || !keySecret) {
      return NextResponse.json({
        orderId: `order_mock_${Date.now()}`,
        amount: 149900,
        currency: "INR",
        keyId: "rzp_test_mock",
        isMock: true,
        message: "Razorpay keys not configured. Activated mock test unlock.",
      });
    }

    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
    const receipt = `rcpt_${Date.now()}`;

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: 149900, // ₹1,499 in paise
        currency: "INR",
        receipt,
        notes: {
          product: "CosmicLens AI — Complete Vedic Master Reading",
        },
      }),
    });

    const order = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: order.error?.description || "Failed to create Razorpay order" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
