// Pi Network SDK v2.0 Integration with Supabase Connect
import { createClient } from '@supabase/supabase-js';

// استدعاء بيانات الربط من ملف .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

declare global {
  interface Window {
    Pi?: {
      init: (config: { version: string; sandbox?: boolean }) => void;
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound: (payment: any) => void
      ) => Promise<any>;
      createPayment: (
        paymentData: any,
        callbacks: any
      ) => Promise<any>;
    };
  }
}

class PiNetworkSDK {
  private initialized = false;

  async init(sandbox = false) {
    if (this.initialized) return true;
    if (!window.Pi) return false;
    try {
      window.Pi.init({ version: '2.0', sandbox });
      this.initialized = true;
      return true;
    } catch (error) {
      return false;
    }
  }

  // دالة الدفع الحقيقية المربوطة بـ Supabase
  async createPayment(amount: number, username: string) {
    if (!window.Pi) return;

    const paymentData = {
      amount,
      memo: `شراء لفات للمستخدم ${username}`,
      metadata: { username }
    };

    const callbacks = {
      onReadyForServerApproval: async (paymentId: string) => {
        // إخطار Supabase بوجود عملية دفع بدأت
        console.log("Payment started:", paymentId);
      },
      onReadyForServerCompletion: async (paymentId: string, txid: string) => {
        // استدعاء المحرك الذي أنشأناه في SQL لزيادة الرصيد فوراً
        const { error } = await supabase.rpc('complete_pi_payment', {
          u_name: username,
          p_amount: amount,
          p_id: paymentId
        });

        if (!error) {
          alert("مبروك! تمت العملية بنجاح وتم إضافة الرصيد.");
        } else {
          alert("حدث خطأ في تحديث الرصيد، تواصل مع الإدارة.");
        }
      },
      onCancel: (paymentId: string) => console.log("User cancelled"),
      onError: (error: Error) => console.error("Payment Error", error),
    };

    return await window.Pi.createPayment(paymentData, callbacks);
  }
}

export const piSDK = new PiNetworkSDK();
