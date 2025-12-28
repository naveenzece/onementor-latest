"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { getOrderStatus } from "@/services/payment/payment";

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState("loading"); // loading, success, failed, error
    const [orderDetails, setOrderDetails] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const orderId = searchParams.get("order_id") || searchParams.get("orderId");

    useEffect(() => {
        if (orderId) {
            checkStatus();
        } else {
            setStatus("error");
            setErrorMessage("Order ID not found in the callback URL.");
        }
    }, [orderId]);

    const checkStatus = async () => {
        setStatus("loading");
        try {
            const result = await getOrderStatus(orderId);
            if (result.success) {
                setOrderDetails(result);
                if (result.status === "CHARGED" || result.status === "SUCCESS") {
                    setStatus("success");
                    // Clear local storage if needed or update user info
                    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
                    if (orderId.startsWith('REG_')) {
                        userInfo.registered = 1;
                        localStorage.setItem('user_info', JSON.stringify(userInfo));
                    }
                } else if (result.status === "PENDING" || result.status === "NEW") {
                    setStatus("pending");
                } else {
                    setStatus("failed");
                }
            } else {
                setStatus("error");
                setErrorMessage(result.error || "Failed to verify payment status.");
            }
        } catch (error) {
            console.error("Status check error:", error);
            setStatus("error");
            setErrorMessage("An unexpected error occurred while verifying your payment.");
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="card shadow-2xl p-8 md:p-10 text-center fade-in">
                {status === "loading" && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <ArrowPathIcon className="w-20 h-20 text-indigo-500 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Verifying Payment</h2>
                        <p className="text-gray-500">Please wait while we confirm your transaction status...</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <CheckCircleIcon className="w-20 h-20 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
                        <p className="text-gray-500">Your registration has been confirmed. You now have full access to the platform.</p>
                        <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 text-sm border border-gray-100">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Order ID:</span>
                                <span className="font-mono font-medium text-gray-900">{orderId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Amount:</span>
                                <span className="font-medium text-gray-900">₹{orderDetails?.amount}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push("/dashboard/coach")}
                            className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all transform hover:scale-[1.02]"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}

                {status === "failed" && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <XCircleIcon className="w-20 h-20 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Payment Failed</h2>
                        <p className="text-gray-500">Unfortunately, your payment could not be processed at this time.</p>
                        {orderDetails?.respMessage && (
                            <p className="text-sm text-red-600 font-medium">Reason: {orderDetails.respMessage}</p>
                        )}
                        <button
                            onClick={() => router.push("/dashboard/coachdashboard/registration-fee")}
                            className="w-full py-3 px-6 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-all transform hover:scale-[1.02]"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {status === "pending" && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <ArrowPathIcon className="w-20 h-20 text-amber-500 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Payment Pending</h2>
                        <p className="text-gray-500">Your payment is being processed by the bank. Please check back in a few minutes.</p>
                        <button
                            onClick={() => router.push("/dashboard/coach")}
                            className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all transform hover:scale-[1.02]"
                        >
                            Dashboard
                        </button>
                    </div>
                )}

                {status === "error" && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <XCircleIcon className="w-20 h-20 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Something Went Wrong</h2>
                        <p className="text-gray-500">{errorMessage}</p>
                        <button
                            onClick={() => router.push("/dashboard/coach")}
                            className="w-full py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition-all"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PaymentCallback() {
    return (
        <div className="flex flex-col min-h-screen bg-professional-grad">
            <Header />
            <main className="flex-grow flex items-center justify-center p-6">
                <Suspense fallback={<div className="spinner"></div>}>
                    <CallbackContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}
