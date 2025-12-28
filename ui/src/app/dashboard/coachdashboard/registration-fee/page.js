"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { ArrowLeftIcon, BanknotesIcon, InformationCircleIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { getRegistrationFee, getMentorProfile } from "@/services/mentor/mentor";
import { createRegistrationSession } from "@/services/payment/payment";
import { toastrSuccess, toastrError } from "@/components/ui/toaster/toaster";

export default function RegistrationFeeSetup() {
    const router = useRouter();
    const [fetching, setFetching] = useState(true);
    const [paying, setPaying] = useState(false);
    const [formData, setFormData] = useState({
        amount: "200.00",
    });
    const [alreadyPaid, setAlreadyPaid] = useState(false);

    useEffect(() => {
        fetchFee();
        checkRegistrationStatus();
    }, []);

    const checkRegistrationStatus = async () => {
        try {
            const userId = localStorage.getItem("userId");
            if (!userId) return;
            const profile = await getMentorProfile(userId);
            if (!profile.error && profile.registered) {
                setAlreadyPaid(true);
            }
        } catch (error) {
            console.error("Error checking registration status:", error);
        }
    };

    const fetchFee = async () => {
        setFetching(true);
        try {
            const response = await getRegistrationFee();
            if (!response.error && response.amount) {
                setFormData({ amount: response.amount.toString() });
            }
        } catch (error) {
            console.error("Error fetching fee:", error);
        } finally {
            setFetching(false);
        }
    };

    const handlePayment = async () => {
        setPaying(true);
        try {
            // Get user from localStorage
            const userId = localStorage.getItem("userId");

            if (!userId) {
                toastrError("User session not found. Please log in again.");
                return;
            }

            console.log(`Initiating registration payment for user ${userId}`);

            const response = await createRegistrationSession(userId);

            if (response.error) {
                toastrError(response.error);
                return;
            }

            if (response.payment_url) {
                toastrSuccess("Redirecting to payment gateway...");
                window.location.href = response.payment_url;
            } else {
                toastrError("Failed to get payment URL. Please contact support.");
            }
        } catch (error) {
            console.error("Payment error:", error);
            toastrError("Failed to initiate payment. Please try again.");
        } finally {
            setPaying(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />

            <main className="flex-grow container-professional py-8 md:py-10 lg:py-12 fade-in">
                {/* Header */}
                <div className="mb-10 md:mb-12">
                    <button
                        onClick={() => router.push("/dashboard/coach")}
                        className="flex items-center text-gray-600 hover:text-[var(--primary)] mb-4 transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-4xl font-bold gradient-text mb-2">
                        Registration Fee
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Complete your onboarding by paying the protocol fee
                    </p>
                </div>

                {fetching ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto">
                        <div className="card spacing-comfortable shadow-xl border-t-4 border-indigo-500">
                            <div className="flex items-center mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mr-4">
                                    <BanknotesIcon className="w-10 h-10 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900">One-time Registration Fee</h2>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 italic text-gray-600 text-center">
                                    "Unlock full platform access, priority support, and premium visibility for your coaching profile."
                                </div>

                                {/* Payment Details */}
                                <div className="border-t border-b border-gray-100 py-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Base Registration Fee</span>
                                        <span className="font-semibold text-gray-900">₹{formData.amount}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold pt-2">
                                        <span className="text-gray-900">Total Amount</span>
                                        <span className="text-indigo-600">₹{formData.amount}</span>
                                    </div>
                                </div>

                                {/* Pay Button */}
                                <button
                                    onClick={alreadyPaid ? () => router.push("/dashboard/coach") : handlePayment}
                                    disabled={paying}
                                    className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-3
                                 ${paying ? 'bg-gray-400 cursor-not-allowed' : alreadyPaid ? 'bg-green-600 hover:bg-green-700' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:from-indigo-700 hover:to-purple-700'}
                             `}
                                >
                                    {paying ? (
                                        <>
                                            <div className="spinner-white mr-2" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                                            <span>Processing...</span>
                                        </>
                                    ) : alreadyPaid ? (
                                        <>
                                            <CheckCircleIcon className="w-6 h-6" />
                                            <span>Registration Completed</span>
                                        </>
                                    ) : (
                                        <>
                                            <CreditCardIcon className="w-6 h-6" />
                                            <span>Pay Now</span>
                                        </>
                                    )}
                                </button>

                                {alreadyPaid && (
                                    <p className="text-center text-green-600 font-medium text-sm flex items-center justify-center gap-1">
                                        <CheckCircleIcon className="w-4 h-4" /> You've already completed the registration.
                                    </p>
                                )}

                                {/* Security Note */}
                                <div className="flex items-center justify-center space-x-2 text-xs text-gray-400 mt-4">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Secure Encrypted Payment</span>
                                </div>
                            </div>
                        </div>

                        {/* FAQ or Info Box */}
                        <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start space-x-3">
                            <InformationCircleIcon className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-amber-900">Why pay a registration fee?</p>
                                <p className="text-xs text-amber-800 leading-relaxed mt-1">
                                    This one-time fee helps us verify your identity, maintain platform quality, and provide you with high-performance coaching tools throughout your journey.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
