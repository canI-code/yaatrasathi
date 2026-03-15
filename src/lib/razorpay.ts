
// Razorpay frontend integration
// Loads the Razorpay checkout script and initiates payment

export type PlanTier = 'basic' | 'pro';
export type PlanPeriod = 'monthly' | 'annual';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name?: string; email?: string };
  theme: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open(): void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById('razorpay-script')) { resolve(); return; }
    const s = document.createElement('script');
    s.id = 'razorpay-script';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(s);
  });
}

export async function initiatePayment(params: {
  plan: PlanTier;
  period: PlanPeriod;
  userId: string;
  userEmail: string;
  userName?: string;
  onSuccess: (paymentId: string) => void;
  onFailure: (reason: string) => void;
}): Promise<void> {
  await loadScript();

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID as string;

  // Call Edge Function to create order
  const res = await fetch(`${supabaseUrl}/functions/v1/create-razorpay-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({
      plan: params.plan,
      period: params.period,
      userId: params.userId,
      userEmail: params.userEmail,
    }),
  });

  if (!res.ok) {
    params.onFailure('Failed to create payment order. Please try again.');
    return;
  }

  const { orderId, amount, currency } = await res.json() as {
    orderId: string; amount: number; currency: string;
  };

  const PLAN_LABELS: Record<string, string> = {
    basic: 'YatraSathi Basic',
    pro: 'YatraSathi Pro',
  };

  const rzp = new window.Razorpay({
    key: razorpayKeyId,
    amount,
    currency,
    name: 'YatraSathi',
    description: `${PLAN_LABELS[params.plan]} — ${params.period === 'annual' ? 'Annual' : 'Monthly'}`,
    order_id: orderId,
    prefill: { name: params.userName, email: params.userEmail },
    theme: { color: '#2A9D8F' },
    handler: (response) => {
      params.onSuccess(response.razorpay_payment_id);
    },
    modal: {
      ondismiss: () => params.onFailure('Payment cancelled.'),
    },
  });

  rzp.open();
}
