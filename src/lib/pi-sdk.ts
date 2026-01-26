// Pi Network SDK v2.0 Final Integration with Supabase RPC
import { createClient } from '@supabase/supabase-js';

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

  // الدالة النهائية المتوافقة مع ملف useSpin والموبايل
  async createPayment(amount: number, memo: string, externalCallbacks?: any) {
    if (!window.Pi) {
        console.error("Pi SDK not found");
        return;
    }

    const paymentData = {
      amount,
      memo: memo,
      metadata: { amount, type: "spin_purchase" }
    };

    const callbacks = {
      onReadyForServerApproval: async (paymentId: string) => {
        // بما أنك على الموبايل، سنقوم بـ log فقط وتخطي الـ Edge Function
        console.log("Payment waiting for completion:", paymentId);
      },
      onReadyForServerCompletion: async (paymentId: string, txid: string) => {
        try {
          // جلب اسم المستخدم الحالي للتأكد من تحديث الحساب الصحيح
          const auth = await window.Pi?.authenticate(['username'], () => {});
          const username = auth?.user?.username;

          // استدعاء الـ SQL Function التي أنشأتها أنت في Supabase
          const { error } = await supabase.rpc('complete_pi_payment', {
            u_name: username,
            p_amount: amount,
            p_id: paymentId
          });

          if (!error) {
            console.log("Database updated via RPC successfully");
            // إبلاغ الواجهة (useSpin) بالنجاح لتشغيل الـ Spin
            if (externalCallbacks?.onReadyForServerCompletion) {
              externalCallbacks.onReadyForServerCompletion(paymentId, txid);
            }
          } else {
            console.error("RPC Error:", error.message);
            alert("Connection error: Your balance will update shortly.");
          }
        } catch (err) {
          console.error("Critical error in completion:", err);
        }
      },
      onCancel: (paymentId: string) => {
        if (externalCallbacks?.onCancel) externalCallbacks.onCancel(paymentId);
      },
      onError: (error: Error, payment?: any) => {
        console.error("Pi Payment Error:", error);
        if (externalCallbacks?.onError) externalCallbacks.onError(error);
      },
    };

    return await window.Pi.createPayment(paymentData, callbacks);
  }
}

export const piSDK = new PiNetworkSDK();
