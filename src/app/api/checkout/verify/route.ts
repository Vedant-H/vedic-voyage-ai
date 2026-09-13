import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = body;

    // Handle mock verification
    if (isMock || razorpay_order_id?.startsWith("order_mock_")) {
      return NextResponse.json({
        success: true,
        verified: true,
        isMock: true,
        message: "Test order verified successfully.",
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({
        success: true,
        verified: true,
        isMock: true,
        message: "Razorpay secret missing. Verified via test fallback.",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isMatch = expectedSignature === razorpay_signature;

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid payment signature verification" },
        { status: 400 }
      );
    }

    // Update authenticated Supabase user metadata if available
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

      if (user && serviceKey && supabaseUrl) {
        const { createClient } = await import("@supabase/supabase-js");
        const adminSupabase = createClient(supabaseUrl, serviceKey);
        await adminSupabase.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...user.user_metadata,
            is_premium: true,
            plan: "premium",
            unlocked_at: new Date().toISOString(),
          },
        });
      }
    } catch (authErr) {
      console.warn("Could not update Supabase user metadata:", authErr);
    }

    return NextResponse.json({
      success: true,
      verified: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
