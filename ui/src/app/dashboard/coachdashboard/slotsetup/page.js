"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { toastrSuccess, toastrError } from "@/components/ui/toaster/toaster";
import { ArrowLeftIcon, CurrencyDollarIcon, ClockIcon } from "@heroicons/react/24/outline";
import { createMentorProfile, getMentorProfile } from "@/services/mentor/mentor";

export default function SlotSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hourlyRate: "",
  });

  useEffect(() => {
    // Fetch existing hourly rate if any
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchHourlyRate(userId);
    }
  }, []);

  const fetchHourlyRate = async (userId) => {
    try {
      const response = await getMentorProfile(userId);
      
      if (!response.error && response.hourly_rate) {
        setFormData({ hourlyRate: response.hourly_rate.toString() });
      }
    } catch (error) {
      console.error("Error fetching hourly rate:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Only allow numbers and one decimal point
    if (name === "hourlyRate") {
      const numericValue = value.replace(/[^0-9.]/g, '');
      // Ensure only one decimal point
      const parts = numericValue.split('.');
      const formattedValue = parts.length > 2 
        ? parts[0] + '.' + parts.slice(1).join('')
        : numericValue;
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hourlyRate = parseFloat(formData.hourlyRate);
    
    if (!formData.hourlyRate || isNaN(hourlyRate) || hourlyRate <= 0) {
      toastrError("Please enter a valid hourly rate");
      return;
    }

    if (hourlyRate < 100) {
      toastrError("Minimum hourly rate is ₹100");
      return;
    }

    if (hourlyRate > 100000) {
      toastrError("Maximum hourly rate is ₹1,00,000");
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

      // Update mentor profile with hourly rate
      const response = await createMentorProfile({
        user_id: userId,
        hourly_rate: hourlyRate,
      });

      if (response.error) {
        toastrError(response.error || "Failed to save hourly rate");
        return;
      }

      toastrSuccess("Hourly rate saved successfully!");
      
      setTimeout(() => {
        router.push("/dashboard/coach");
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      toastrError(error.message || "Failed to save hourly rate. Please try again.");
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
            Slot Setup
          </h1>
          <p className="text-gray-600 text-lg">
            Set your hourly rate for coaching sessions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="card spacing-comfortable">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                <CurrencyDollarIcon className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Hourly Rate</h2>
                <p className="text-sm text-gray-600">Set your pricing for 1-hour sessions</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Hourly Rate Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate per Hour (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-lg font-semibold">₹</span>
                  </div>
                  <input
                    type="text"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                    required
                    className="input-professional pl-10 text-lg font-semibold"
                    placeholder="1000"
                    min="100"
                    max="100000"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Minimum: ₹100 | Maximum: ₹1,00,000
                </p>
              </div>

              {/* Rate Preview */}
              {formData.hourlyRate && !isNaN(parseFloat(formData.hourlyRate)) && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <ClockIcon className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Rate Preview</span>
                  </div>
                  <div className="space-y-1 text-sm text-blue-700">
                    <p>1 hour session: <strong className="text-lg">₹{parseFloat(formData.hourlyRate).toLocaleString('en-IN')}</strong></p>
                    <p>30 min session: <strong>₹{Math.round(parseFloat(formData.hourlyRate) / 2).toLocaleString('en-IN')}</strong></p>
                    <p>2 hour session: <strong>₹{(parseFloat(formData.hourlyRate) * 2).toLocaleString('en-IN')}</strong></p>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900">
                  <strong>Note:</strong> This rate will be used to calculate the price for all your coaching sessions. 
                  You can update this rate anytime from your profile settings.
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
                  <div className="spinner mr-2" style={{width: '20px', height: '20px', borderWidth: '2px'}}></div>
                  Saving...
                </div>
              ) : (
                "Save Hourly Rate"
              )}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}

