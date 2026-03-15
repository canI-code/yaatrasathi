// Supabase Edge Function: razorpay-webhook
// Handles Razorpay payment.captured webhook to activate subscriptions
// Deploy: supabase functions deploy razorpay-webhook
// Set webhook URL in Razorpay dashboard: https://<project>.supabase.co/functions/v1/razorpay-webhook

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const RAZORPAY_WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  // Verify webhook signature
  const hmac = createHmac("sha256", RAZORPAY_WEBHOOK_SECRET);
  hmac.update(body);
  const digest = hmac.digest("hex");

  if (digest !== signature) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(body) as {
    event: string;
    payload: {
      payment: {
        entity: {
          id: string;
          order_id: string;
          notes: { userId: string; plan: string; period: string };
        };
      };
    };
  };

  if (event.event !== "payment.captured") {
    return new Response("Ignored", { status: 200 });
  }

  const { userId, plan, period } = event.payload.payment.entity.notes;
  const paymentId = event.payload.payment.entity.id;

  if (!userId || !plan || !period) {
    return new Response("Missing notes", { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Calculate expiry
  const now = new Date();
  const expiresAt = new Date(now);
  if (period === "annual") {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  } else {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  }

  // Upsert subscription
  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      plan,
      status: "active",
      period,
      started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      razorpay_subscription_id: paymentId,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("Supabase upsert error:", error);
    return new Response("DB error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
});
