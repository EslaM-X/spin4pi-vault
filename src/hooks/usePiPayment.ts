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
      toast.error('Pi Network not available');
      return { success: false, error: 'Pi Network not available' };
    }

    setIsPaying(true);

    return new Promise((resolve) => {
      const callbacks = {
        // مرحلة الموافقة من السيرفر
        onReadyForServerApproval: async (paymentId: string) => {
          try {
            const { data, error } = await supabase.functions.invoke('approve-payment', {
              body: { payment_id: paymentId, pi_username: piUsername, amount, memo }
            });

            if (error) {
              console.error('Approval failed:', error);
              toast.error('Payment approval failed');
              resolve({ success: false, error: 'Approval failed' });
            } else {
              console.log('Payment approved:', data);
            }
          } catch (err) {
            console.error('Approval error:', err);
            toast.error('Payment approval failed');
            resolve({ success: false, error: 'Approval error' });
          }
        },

        // مرحلة إكمال الدفع بعد التحويل على blockchain
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          try {
            const { data, error } = await supabase.functions.invoke('complete-payment', {
              body: { payment_id: paymentId, txid }
            });

            if (error) {
              console.error('Completion failed:', error);
              toast.error('Payment completion failed');
              resolve({ success: false, error: 'Completion failed' });
            } else {
              console.log('Payment completed:', data);
              toast.success('Payment successful!');
              setIsPaying(false);
              resolve({ success: true, paymentId, txid });
            }
          } catch (err) {
            console.error('Completion error:', err);
            toast.error('Payment completion failed');
            setIsPaying(false);
            resolve({ success: false, error: 'Completion error' });
          }
        },

        // إلغاء الدفع
        onCancel: (paymentId: string) => {
          console.log('Payment cancelled:', paymentId);
          toast.info('Payment cancelled');
          setIsPaying(false);
          setCurrentPayment(null);
          resolve({ success: false, error: 'cancelled' });
        },

        // أي خطأ أثناء العملية
        onError: (error: Error, payment?: PaymentDTO) => {
          console.error('Payment error:', error, payment);
          toast.error('Payment failed: ' + error.message);
          setIsPaying(false);
          setCurrentPayment(null);
          resolve({ success: false, error: error.message });
        },
      };

      // إنشاء الدفع عن طريق Pi SDK فعليًا
      piSDK.createPayment(amount, memo, { ...metadata, pi_username: piUsername }, callbacks)
        .then((payment) => {
          if (payment) {
            setCurrentPayment(payment);
            console.log('Payment created:', payment);
          } else {
            console.error('Failed to create payment');
            setIsPaying(false);
            resolve({ success: false, error: 'Failed to create payment' });
          }
        })
        .catch((err) => {
          console.error('Payment creation error:', err);
          toast.error('Payment creation failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
          setIsPaying(false);
          resolve({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
        });
    });
  }, []);

  return {
    createPayment,
    isPaying,
    currentPayment,
  };
}
