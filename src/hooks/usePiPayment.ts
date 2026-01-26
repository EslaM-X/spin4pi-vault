import { useState, useCallback } from 'react';
import { piSDK, PaymentDTO } from '@/lib/pi-sdk';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
  txid?: string;
}

export function usePiPayment() {
  const [isPaying, setIsPaying] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<PaymentDTO | null>(null);

  const createPayment = useCallback(async (
    amount: number,
    memo: string,
    piUsername: string,
    metadata: Record<string, unknown> = {}
  ): Promise<PaymentResult> => {
    if (!piSDK.isAvailable()) {
      toast.error('الرجاء فتح التطبيق داخل Pi Browser.');
      return { success: false, error: 'Pi Network not available' };
    }

    setIsPaying(true);

    return new Promise((resolve) => {
      const callbacks = {
        // 1. مرحلة الموافقة (Approval)
        // ملاحظة: Pi SDK يتطلب الرد من السيرفر للموافقة، سنقوم بإرسال الطلب لـ Edge Function
        onReadyForServerApproval: async (paymentId: string) => {
          console.log("الخطوة 1: طلب الموافقة من السيرفر للعملية:", paymentId);
          try {
            // يمكن استخدام نفس الـ Edge Function مع تمرير "حالة" مختلفة إذا أردت، 
            // ولكن حالياً سنركز على مرحلة الإكمال لضمان الأمان.
            console.log("Server approval logic goes here if required by your flow.");
          } catch (err) {
            console.error('Approval error:', err);
          }
        },

        // 2. مرحلة إكمال الدفع (Completion) - الأهم للأمان
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          console.log("الخطوة 2: الدفع تم بنجاح، جاري التأكيد وتحديث الرصيد...");
          try {
            // استدعاء الـ Edge Function الخاصة بك التي تظهر في الصورة
            const { data, error } = await supabase.functions.invoke('verify-payment', {
              body: { 
                paymentId: paymentId, 
                username: piUsername,
                txid: txid
              }
            });

            if (error || !data?.success) {
              console.error('خطأ في التأكيد:', error);
              toast.error('فشل تحديث الرصيد تلقائياً، يرجى التواصل مع الدعم.');
              resolve({ success: false, error: 'Completion failed' });
            } else {
              toast.success('تمت عملية الدفع وإضافة اللفات بنجاح!');
              
              // تحديث الصفحة لضمان ظهور الرصيد الجديد
              setTimeout(() => {
                window.location.reload();
              }, 1500);

              setIsPaying(false);
              resolve({ success: true, paymentId, txid });
            }
          } catch (err) {
            console.error('Completion error:', err);
            toast.error('خطأ في الاتصال بالسيرفر أثناء التأكيد.');
            setIsPaying(false);
            resolve({ success: false, error: 'Connection error' });
          }
        },

        onCancel: (paymentId: string) => {
          console.log('Payment cancelled:', paymentId);
          toast.info('تم إلغاء عملية الدفع.');
          setIsPaying(false);
          setCurrentPayment(null);
          resolve({ success: false, error: 'cancelled' });
        },

        onError: (error: Error, payment?: PaymentDTO) => {
          console.error('Pi SDK Error:', error);
          toast.error('حدث خطأ في الدفع: ' + error.message);
          setIsPaying(false);
          setCurrentPayment(null);
          resolve({ success: false, error: error.message });
        },
      };

      // بدء عملية الدفع الرسمية عبر SDK
      piSDK.createPayment(amount, memo, { ...metadata, pi_username: piUsername }, callbacks)
        .then((payment) => {
          if (payment) {
            setCurrentPayment(payment);
          } else {
            setIsPaying(false);
            resolve({ success: false, error: 'Payment initialization failed' });
          }
        })
        .catch((err) => {
          console.error('Pi SDK Create Error:', err);
          setIsPaying(false);
          resolve({ success: false, error: String(err) });
        });
    });
  }, []);

  return {
    createPayment,
    isPaying,
    currentPayment,
  };
}
