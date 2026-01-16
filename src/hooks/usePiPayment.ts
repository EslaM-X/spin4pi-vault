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
      toast.error('Pi Network not available. Please use Pi Browser.');
      return { success: false, error: 'Pi Network not available' };
    }

    setIsPaying(true);

    return new Promise((resolve) => {
      const callbacks = {
        // 1. مرحلة الموافقة من السيرفر (تم تعديل paymentId هنا)
        onReadyForServerApproval: async (paymentId: string) => {
          console.log("Step 1: Ready for server approval. ID:", paymentId);
          try {
            const { data, error } = await supabase.functions.invoke('approve-payment', {
              body: { 
                paymentId: paymentId, 
                pi_username: piUsername, 
                amount: amount, 
                memo: memo 
              }
            });

            if (error) {
              console.error('Approval failed:', error);
              toast.error('Server approval failed');
              resolve({ success: false, error: 'Approval failed' });
            } else {
              console.log('Server approved the payment successfully:', data);
            }
          } catch (err) {
            console.error('Approval error:', err);
            toast.error('Connection error during approval');
            resolve({ success: false, error: 'Approval error' });
          }
        },

        // 2. مرحلة إكمال الدفع (تم تعديل paymentId هنا)
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          console.log("Step 2: Payment authorized by user. Completing...", txid);
          try {
            const { data, error } = await supabase.functions.invoke('complete-payment', {
              body: { 
                paymentId: paymentId, 
                txid: txid 
              }
            });

            if (error) {
              console.error('Completion failed:', error);
              toast.error('Server failed to record completion');
              resolve({ success: false, error: 'Completion failed' });
            } else {
              console.log('Payment fully completed on server:', data);
              toast.success('Payment successful! Your Pi is being processed.');
              setIsPaying(false);
              resolve({ success: true, paymentId, txid });
            }
          } catch (err) {
            console.error('Completion error:', err);
            toast.error('Connection error during completion');
            setIsPaying(false);
            resolve({ success: false, error: 'Completion error' });
          }
        },

        onCancel: (paymentId: string) => {
          console.log('Payment cancelled by user:', paymentId);
          toast.info('Payment was cancelled');
          setIsPaying(false);
          setCurrentPayment(null);
          resolve({ success: false, error: 'cancelled' });
        },

        onError: (error: Error, payment?: PaymentDTO) => {
          console.error('Pi SDK Error:', error, payment);
          toast.error('Payment failed: ' + error.message);
          setIsPaying(false);
          setCurrentPayment(null);
          resolve({ success: false, error: error.message });
        },
      };

      // استدعاء الـ SDK الفعلي
      piSDK.createPayment(amount, memo, { ...metadata, pi_username: piUsername }, callbacks)
        .then((payment) => {
          if (payment) {
            setCurrentPayment(payment);
          } else {
            setIsPaying(false);
            resolve({ success: false, error: 'Empty payment response' });
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
