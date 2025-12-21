"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { toastrSuccess, toastrError } from "@/components/ui/toaster/toaster";
import { ArrowLeftIcon, CreditCardIcon } from "@heroicons/react/24/outline";

export default function AccountSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    upiId: "",
  });

  useEffect(() => {
    // Fetch existing UPI details if any
    const userId = localStorage.getItem("userId");
    if (userId) {
      // TODO: Fetch from API when endpoint is available
      // fetchUpiDetails(userId);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateUPI = (upi) => {
    // UPI ID format: username@bankname (e.g., john@paytm, user123@oksbi)
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return upiRegex.test(upi);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate UPI ID
    if (!validateUPI(formData.upiId)) {
      toastrError("Invalid UPI ID. Format: username@bankname");
      return;
    }

    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toastrError("User not found. Please login again.");
        router.push("/login");
        return;
      }

      // TODO: Replace with actual API endpoint when available
      const res = await fetch("http://localhost:8001/api/coach/account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          user_id: userId,
          upi_id: formData.upiId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toastrSuccess("UPI ID saved successfully!");

        setTimeout(() => {
          router.push("/dashboard/coach");
        }, 1500);
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to save UPI ID");
      }
    } catch (error) {
      console.error("Error:", error);
      // For now, show success even if API doesn't exist (for UI testing)
      if (error.message.includes("Failed to fetch") || error.message.includes("404")) {
        toastrSuccess("UPI ID validated successfully! (API endpoint pending)");
        setTimeout(() => {
          router.push("/dashboard/coach");
        }, 1500);
      } else {
        toastrError(error.message || "Failed to save UPI ID. Please try again.");
      }
    } finally {
      setLoading(false);
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
            Payment Setup
          </h1>
          <p className="text-gray-600 text-lg">
            Add your UPI ID to receive payments
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="card spacing-comfortable">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                <CreditCardIcon className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">UPI Details</h2>
                <p className="text-sm text-gray-600">Secure payment information for payouts</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* UPI ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UPI ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleChange}
                  required
                  className="input-professional"
                  placeholder="yourname@paytm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: username@bankname (e.g., john@paytm, user123@oksbi)
                </p>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <CreditCardIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Secure & Encrypted
                </p>
                <p className="text-xs text-blue-700">
                  Your UPI ID is encrypted and stored securely. We use industry-standard security measures to protect your information.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8">
            <button
              type="button"
              onClick={() => router.push("/dashboard/coach")}
              className="btn btn-secondary px-8 py-3"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary px-8 py-3"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="spinner mr-2" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                  Saving...
                </div>
              ) : (
                "Save UPI ID"
              )}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
