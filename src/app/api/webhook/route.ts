import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Erro na assinatura do webhook:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as any;
      const { userId, planName } = session.metadata;

      // Atualizar o plano do usuário no Supabase
      const { error } = await supabase
        .from("profiles")
        .update({ 
          plan_name: planName,
          subscription_status: "active",
          stripe_customer_id: session.customer as string,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);

      if (error) {
        console.error("Erro ao atualizar perfil:", error);
      }
      break;

    case "customer.subscription.deleted":
      const subscription = event.data.object as any;
      // Tratar cancelamento
      await supabase
        .from("profiles")
        .update({ subscription_status: "canceled", plan_name: "free" })
        .eq("stripe_customer_id", subscription.customer as string);
      break;

    default:
      console.log(`Evento não tratado: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
