"use client";

import MainHeader from "@/components/Header/mainHeader";
import Footer from "@/components/Footer/footer";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOTP, sendOTP } from "@/services/auth/auth";
import { toastrSuccess, toastrError } from "@/components/ui/toaster/toaster";

export default function VerifyOtp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    // Get email and role from query params
    const emailParam = searchParams.get("email");
    const roleParam = searchParams.get("role");

    if (!emailParam) {
      // If no email, redirect to signup
      toastrError("Email is required. Please sign up first.");
      router.push("/signup");
      return;
    }

    setEmail(emailParam);
    // Map role: 'coach' from signup becomes 'mentor' in backend, 'user' stays 'user'
    setRole(roleParam || "user");
  }, [searchParams, router]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      toastrError("OTP must be exactly 6 digits");
      return;
    }

    if (!email) {
      toastrError("Email is required");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOTP(email, otp);

      if (result.error) {
        toastrError(result.error);
      } else {
        // Store user data
        if (result.user) {
          localStorage.setItem("userId", result.user.id);
          localStorage.setItem("userRole", result.user.role);
          localStorage.setItem("userEmail", result.user.email);
          localStorage.setItem("userName", result.user.name);
          if (result.token) {
            localStorage.setItem("token", result.token);
          }

          toastrSuccess("Email verified successfully!");

          // Redirect based on role
          const userRole = result.user.role;
          if (userRole === "mentor" || userRole === "coach") {
            router.push("/dashboard/coach");
          } else {
            router.push("/dashboard/user");
          }
        }
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      toastrError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toastrError("Email is required");
      return;
    }

    setResending(true);
    try {
      const result = await sendOTP(email);
      if (result.error) {
        toastrError(result.error);
      } else {
        toastrSuccess("OTP resent to your email!");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      toastrError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />

      <main className="flex-grow flex items-center justify-center px-6 py-16 md:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-7xl grid md:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-start">
          
          {/* Left Side - Information */}
          <div className="hidden md:flex flex-col justify-start space-y-10 fade-in pt-8">
            <div className="text-center space-y-6">
              <div className="inline-block">
                <Image 
                  src="/images/onementor.jpg"
                  alt="OneMentor"
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-[var(--primary)] shadow-xl mx-auto"
                />
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold gradient-text leading-tight">
                OneMentor
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600">
                Verify Your Email
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800">
                Check Your Email
              </h2>
              <p className="text-lg text-gray-600">
                We've sent a 6-digit verification code to <strong>{email || "your email"}</strong>
              </p>
            </div>

            <div className="space-y-5">
              <h3 className="font-semibold text-gray-800 text-xl">What's next?</h3>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-base">Check your email inbox</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-base">Enter the 6-digit code</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-base">Start your journey with OneMentor</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Side - OTP Verification Form */}
          <div className="card glass-effect max-w-md w-full mx-auto spacing-extra-generous fade-in pt-8">
            <div className="text-center mb-10 md:mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] mb-6">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                Verify Your Email
              </h2>
              <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
                Enter the 6-digit code sent to <br />
                <strong className="text-gray-800">{email || "your email"}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-7">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-3">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="input-professional text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  6-digit code
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="btn btn-primary w-full py-4 text-lg font-semibold mt-8"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2" style={{width: '20px', height: '20px', borderWidth: '2px'}}></div>
                    Verifying...
                  </div>
                ) : (
                  "Verify & Continue"
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending || !email}
                  className="text-sm text-[var(--primary)] hover:underline font-medium"
                >
                  {resending ? "Sending..." : "Didn't receive the code? Resend"}
                </button>
              </div>
            </form>

            <div className="mt-10 pt-6 border-t border-gray-200 text-center">
              <p className="text-base text-gray-600">
                Wrong email?{" "}
                <Link href="/signup" className="text-[var(--primary)] font-semibold hover:underline">
                  Sign Up Again
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

