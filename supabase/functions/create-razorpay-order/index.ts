// Supabase Edge Function: create-razorpay-order
// Creates a Razorpay order for one-time or subscription payment
// Deploy: supabase functions deploy create-razorpay-order

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")!;
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const PLAN_PRICES: Record<string, Record<string, number>> = {
  basic:   { monthly: 19900, annual: 169900 },  // paise (₹199, ₹1699)
  pro:     { monthly: 49900, annual: 399900 },  // paise (₹499, ₹3999)
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { plan, period, userId, userEmail } = await req.json() as {
      plan: string; period: string; userId: string; userEmail: string;
    };

    if (!PLAN_PRICES[plan]?.[period]) {
      return new Response(JSON.stringify({ error: "Invalid plan or period" }), { status: 400, headers: corsHeaders });
    }

    const amount = PLAN_PRICES[plan][period];

    // Create Razorpay order
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Basic ${auth}` },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `ys_${userId.slice(0, 8)}_${Date.now()}`,
        notes: { userId, plan, period, userEmail },
      }),
    });

    if (!orderRes.ok) {
      const err = await orderRes.text();
      return new Response(JSON.stringify({ error: err }), { status: 500, headers: corsHeaders });
    }

    const order = await orderRes.json();
    return new Response(JSON.stringify({ orderId: order.id, amount, currency: "INR" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
