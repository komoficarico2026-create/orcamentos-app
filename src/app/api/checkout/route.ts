import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { priceId, userId, email, planName } = await req.json();

    if (!priceId || !userId) {
      return NextResponse.json({ error: "Parâmetros ausentes" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/dashboard?canceled=true`,
      customer_email: email,
      metadata: {
        userId,
        planName,
      },
      subscription_data: {
        metadata: {
          userId,
        },
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err: any) {
    console.error("Erro no Checkout Session:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
