import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { loadRazorpayScript } from '../lib/loadRazorpayScript';
import {
  verifyHotelPayment,
  type HotelPaymentOrderData,
} from '../services/paymentApi';
import type { RazorpaySuccessResponse } from '../types/razorpay';

export interface RazorpayPrefill {
  name?: string;
  email?: string;
  contact?: string;
}

export interface OpenRazorpayCheckoutParams {
  orderData: HotelPaymentOrderData;
  description: string;
  prefill?: RazorpayPrefill;
  /** Called after signature verification succeeds. */
  onSuccess: (response: RazorpaySuccessResponse) => void | Promise<void>;
  onDismiss?: () => void;
  onFailed?: (message: string) => void;
}

export function useRazorpayCheckout() {
  const openRazorpayCheckout = useCallback(
    async ({
      orderData,
      description,
      prefill,
      onSuccess,
      onDismiss,
      onFailed,
    }: OpenRazorpayCheckoutParams) => {
      await loadRazorpayScript();

      if (!window.Razorpay) {
        throw new Error('Razorpay checkout is not available');
      }

      const toastId = toast.loading('Opening secure payment…');

      return new Promise<void>((resolve, reject) => {
        let settled = false;

        const finish = (fn: () => void) => {
          if (settled) return;
          settled = true;
          toast.dismiss(toastId);
          fn();
        };

        const rzp = new window.Razorpay!({
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Plumtrips',
          description,
          order_id: orderData.orderId,
          prefill: {
            name: prefill?.name,
            email: prefill?.email,
            contact: prefill?.contact,
          },
          theme: { color: '#7c3aed' },
          handler: async (response) => {
            try {
              toast.loading('Verifying payment…', { id: toastId });
              await verifyHotelPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              toast.dismiss(toastId);
              await onSuccess(response);
              finish(() => resolve());
            } catch (err: unknown) {
              const msg =
                err instanceof Error ? err.message : 'Payment verification failed';
              toast.error(msg, { id: toastId });
              onFailed?.(msg);
              finish(() => reject(err instanceof Error ? err : new Error(msg)));
            }
          },
          modal: {
            ondismiss: () => {
              toast.error('Payment cancelled', { id: toastId });
              onDismiss?.();
              finish(() => reject(new Error('Payment cancelled')));
            },
          },
        });

        rzp.on('payment.failed', (res) => {
          const msg =
            res.error?.description || res.error?.reason || 'Payment failed';
          toast.error(msg, { id: toastId });
          onFailed?.(msg);
          finish(() => reject(new Error(msg)));
        });

        toast.dismiss(toastId);
        setTimeout(() => {
          try {
            rzp.open();
          } catch (err: any) {
            onFailed?.(err.message);
            finish(() => reject(err));
          }
        }, 50);
      });
    },
    []
  );

  return { openRazorpayCheckout };
}
