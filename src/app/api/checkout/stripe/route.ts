import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { origin } = new URL(req.url);
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    // If Stripe secret is not provided, provide instant test checkout simulation
    if (!stripeSecretKey) {
      return NextResponse.json({
        url: `${origin}/reading?unlocked=true&mock=stripe`,
        isMock: true,
        message: "Stripe API key not configured. Activated mock test unlock.",
      });
    }

    // Call Stripe Checkout Sessions API directly via standard REST
    const params = new URLSearchParams();
    params.append("payment_method_types[]", "card");
    params.append("mode", "payment");
    params.append("success_url", `${origin}/reading?unlocked=true&session_id={CHECKOUT_SESSION_ID}`);
    params.append("cancel_url", `${origin}/reading?canceled=true`);
    params.append("line_items[0][price_data][currency]", "usd");
    params.append("line_items[0][price_data][unit_amount]", "1900"); // $19.00
    params.append("line_items[0][price_data][product_data][name]", "CosmicLens AI — Complete Vedic Master Reading");
    params.append(
      "line_items[0][price_data][product_data][description]",
      "Full 12-house analysis, 120-year Vimshottari dasha timeline, classical BPHS remedies & high-res vector PDF."
    );
    params.append("line_items[0][quantity]", "1");

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const session = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: session.error?.message || "Stripe checkout session failed" },
        { status: response.status }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
