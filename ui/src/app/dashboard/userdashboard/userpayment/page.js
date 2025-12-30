"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toastrSuccess, toastrError } from "@/components/ui/toaster/toaster";

import { createPaymentSession, triggerPaymentWebhook } from "@/services/payment/payment";

const PaymentPageContent = () => {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  useEffect(() => {
    // Check if this is a callback from Juspay pointing to this page by mistake
    const orderId = searchParams.get("order_id") || searchParams.get("orderId");
    if (!bookingId && orderId) {
      const queryString = searchParams.toString();
      router.replace(`/payment/callback?${queryString}`);
      return;
    }

    if (!bookingId) {
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        const data = await createPaymentSession(bookingId);

        if (data.error) {
          if (data.error === 'Booking is already paid' || data.alreadyPaid) {
            toastrSuccess("Booking is already paid");
            setSessionData({ alreadyPaid: true });
          } else {
            toastrError(data.error || "Failed to load payment session");
          }
        } else {
          setSessionData(data);

          // Auto-redirect to Juspay if payment_url is present
          const paymentUrl = data.payment_url;
          console.log("Payment URL received:", paymentUrl);

          if (paymentUrl) {
            // Only redirect if the URL is different from current to avoid infinite loops
            const currentUrl = window.location.href;
            if (paymentUrl !== currentUrl && !paymentUrl.endsWith(window.location.search)) {
              console.log("Redirecting to:", paymentUrl);
              window.location.href = paymentUrl;
            }
          }
        }
      } catch (err) {
        console.error("Error fetching session:", err);
        toastrError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [bookingId]);

  const handleTestPayment = async (status) => {
    if (!sessionData?.session?.order_id) {
      toastrError("Order ID missing");
      return;
    }

    setProcessing(true);
    try {
      const eventName = status === 'success' ? 'ORDER_SUCCEEDED' : 'ORDER_FAILED';
      const orderId = sessionData.session.order_id;

      const payload = {
        event_name: eventName,
        date_created: new Date().toISOString(),
        content: {
          order: {
            order_id: orderId,
            status: status === 'success' ? 'CHARGED' : 'FAILED',
            amount: 100, // Dummy amount or fetch from session if available
            currency: 'INR',
            txn_id: 'test_txn_' + Date.now()
          }
        }
      };

      const result = await triggerPaymentWebhook(payload);

      if (result.success || result.isOk) {
        if (status === 'success') {
          toastrSuccess("Payment confirmed successfully (Test Mode)");
          setPaymentCompleted(true);
        } else {
          toastrError("Payment cancelled (Test Mode)");
          router.push('/dashboard/user');
        }
      } else {
        toastrError(result.error || "Webhook processing failed");
      }

    } catch (err) {
      console.error("Payment test error:", err);
      toastrError("Failed to process test payment");
    } finally {
      setProcessing(false);
    }
  };

  const [paymentCompleted, setPaymentCompleted] = useState(false);

  if (!bookingId) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card-compact bg-white rounded-xl shadow-lg p-8">
        <p className="text-red-500 font-semibold">Missing Booking ID</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-professional-grad flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center fade-in">
        {loading ? (
          <div className="space-y-6">
            <div className="spinner mx-auto w-16 h-16 border-4"></div>
            <h2 className="text-2xl font-bold text-gray-900">Redirecting to Payment</h2>
            <p className="text-gray-500">Please wait while we prepare your secure transaction...</p>
          </div>
        ) : sessionData?.alreadyPaid || paymentCompleted ? (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Completed</h1>
            <p className="text-gray-600 mb-6">Your mentorship session has been confirmed. You can now access it from your dashboard.</p>
            <button
              onClick={() => router.push('/dashboard/user')}
              className="w-full py-4 bg-[var(--primary)] text-white rounded-2xl font-bold hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Initialization Failed</h1>
            <p className="text-gray-600 mb-6">We couldn't reach the payment gateway. Please try again or contact support.</p>
            <button
              onClick={() => router.back()}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              Back to Booking
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const PaymentPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
};

export default PaymentPage;
