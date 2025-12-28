"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toastrSuccess, toastrError } from "@/components/ui/toaster/toaster";

import { createPaymentSession, triggerPaymentWebhook } from "@/services/payment/payment";

const PaymentPage = () => {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  useEffect(() => {
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

  if (!bookingId) return <div className="p-8 text-center">Missing Booking ID</div>;
  if (loading) return <div className="p-8 text-center">Loading payment details...</div>;

  if (sessionData?.alreadyPaid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
          <h1 className="text-2xl font-bold mb-2">Payment Completed</h1>
          <p className="text-gray-600 mb-6">This booking has already been paid for.</p>
          <button
            onClick={() => router.push('/dashboard/user')}
            className="w-full py-3 bg-[var(--primary)] text-white rounded-lg font-semibold hover:opacity-90 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (paymentCompleted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Your booking has been confirmed.</p>
          <button
            onClick={() => router.push('/dashboard/user')}
            className="w-full py-3 bg-[var(--primary)] text-white rounded-lg font-semibold hover:opacity-90 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-4">
          Test Payment Portal
        </h1>

        <div className="mb-6 space-y-2">
          <p className="flex justify-between"><span className="text-gray-600">Booking ID:</span> <span className="font-semibold">{bookingId}</span></p>
          <p className="flex justify-between"><span className="text-gray-600">Order ID:</span> <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{sessionData?.session?.order_id}</span></p>
          <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-200">
            ⚠ Test Mode Enabled. No actual money will be deducted.
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleTestPayment('success')}
            disabled={processing}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex justify-center items-center"
          >
            {processing ? 'Processing...' : 'Confirm Payment (Success)'}
          </button>

          <button
            onClick={() => handleTestPayment('failure')}
            disabled={processing}
            className="w-full py-3 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition disabled:opacity-50"
          >
            Cancel Payment (Fail)
          </button>
        </div>

        <div className="mt-6 text-center">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 text-sm">
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
