"use client";

import Footer from "@/components/Footer/footer";
import MainHeader from "@/components/Header/mainHeader";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toastrSuccess, toastrError } from "@/components/ui/toaster/toaster";
import { login, sendOTP, verifyOTP } from "@/services/auth/auth";
import Image from "next/image";
import Loader from "@/components/ui/loader/loader";

export default function Login() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [formData, setFormData] = useState({ email: "", password: "", otp: "" });
  const [loading, setLoading] = useState(false);

  const handleFormData = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Password login
  async function handlePasswordLogin(e) {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toastrError("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);

      if (result.error) {
        // Check if user needs verification
        if (result.requiresVerification) {
          toastrError(result.error);
          // Send OTP and redirect to verify-otp page
          const userEmail = result.email || formData.email;
          const roleParam = result.role === 'mentor' || result.role === 'user';

          // Send OTP automatically
          sendOTP(userEmail).then((otpResult) => {
            if (otpResult.error) {
              toastrError("Failed to send OTP. Please try again.");
            } else {
              toastrSuccess("OTP sent to your email!");
            }
            // Redirect to verify-otp page - keep loader visible during redirect
            setTimeout(() => {
              router.push(`/verify-otp?email=${encodeURIComponent(userEmail)}&role=${roleParam}`);
            }, 1000);
          }).catch((err) => {
            console.error("Error sending OTP:", err);
            // Still redirect even if OTP send fails - keep loader visible during redirect
            setTimeout(() => {
              router.push(`/verify-otp?email=${encodeURIComponent(userEmail)}&role=${roleParam}`);
            }, 1000);
          });
          // Don't set loading to false - keep it visible during redirect
        } else {
          toastrError(result.error);
          setLoading(false);
        }
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

          toastrSuccess("Login successful!");

          // Redirect based on role - keep loader visible during redirect
          const role = result.user.role;
          if (role === "mentor") {
            router.push("/dashboard/coach");
          } else {
            router.push("/dashboard/user");
          }
          // Don't set loading to false - keep it visible during redirect
        } else {
          setLoading(false);
        }
      }
    } catch (err) {
      toastrError("Network error");
      setLoading(false);
    }
  }

  // OTP login - send OTP
  async function handleSendOtp(e) {
    e.preventDefault();
    if (!formData.email) {
      toastrError("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const result = await sendOTP(formData.email);

      if (result.error) {
        toastrError(result.error);
        setLoading(false);
      } else {
        toastrSuccess("OTP sent to your email!");
        setLoginMethod('otp-verify');
        setLoading(false);
      }
    } catch (err) {
      toastrError("Network error");
      setLoading(false);
    }
  }

  // OTP login - verify OTP
  async function handleVerifyOtp(e) {
    e.preventDefault();
    if (!/^\d{6}$/.test(formData.otp)) {
      toastrError("OTP must be exactly 6 digits");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOTP(formData.email, formData.otp);

      if (result.error) {
        toastrError(result.error);
        setLoading(false);
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

          toastrSuccess("Login successful!");

          // Redirect based on role - keep loader visible during redirect
          const role = result.user.role;
          if (role === "mentor") {
            router.push("/dashboard/coach");
          } else {
            router.push("/dashboard/user");
          }
          // Don't set loading to false - keep it visible during redirect
        } else {
          setLoading(false);
        }
      }
    } catch (err) {
      toastrError("Network error");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen relative">
      <MainHeader />

      <Loader
        isLoading={loading}
        message={loginMethod === 'password' ? "Signing in..." : loginMethod === 'otp' ? "Sending OTP..." : "Verifying OTP..."}
      />

      <main className="flex-grow flex items-center justify-center px-4 py-12 md:py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 md:gap-12 items-center">

          {/* Left Side - Branding */}
          <div className="hidden md:flex flex-col justify-center items-center space-y-6 fade-in">
            <div className="text-center space-y-4">
              <div className="inline-block">
                <Image
                  src="/images/onementor.jpg"
                  alt="OneMentor"
                  width={100}
                  height={100}
                  className="rounded-full border-4 border-[var(--primary)] shadow-xl mx-auto"
                />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold gradient-text leading-tight">
                OneMentor
              </h1>
              <p className="text-lg lg:text-xl text-gray-600">
                Continuous Growth Platform
              </p>
            </div>

            <div className="text-center space-y-3">
              <h2 className="text-xl lg:text-2xl font-semibold text-gray-800">
                Welcome Back!
              </h2>
              <p className="text-base text-gray-600 max-w-sm mx-auto">
                Your journey to continuous growth starts here. Sign in to access your personalized coaching experience.
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="card glass-effect max-w-md w-full mx-auto p-8 fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {loginMethod === 'password' ? "Sign In" : loginMethod === 'otp' ? "Sign In with OTP" : "Verify OTP"}
              </h2>
              <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                {loginMethod === 'password'
                  ? "Enter your email and password to continue"
                  : loginMethod === 'otp'
                    ? "Enter your email to receive a one-time password"
                    : "Enter the 6-digit code sent to your email"}
              </p>
            </div>

            {/* Login Method Toggle */}
            <div className="flex gap-2 mb-6 justify-center">
              <button
                type="button"
                onClick={() => setLoginMethod('password')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${loginMethod === 'password'
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('otp')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${loginMethod === 'otp' || loginMethod === 'otp-verify'
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                OTP
              </button>
            </div>

            {/* Password Login Form */}
            {loginMethod === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormData}
                    className="input-professional"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormData}
                    className="input-professional"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full py-3 text-base font-semibold mt-6"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
            )}

            {/* OTP Send Form */}
            {loginMethod === 'otp' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormData}
                    className="input-professional"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full py-3 text-base font-semibold mt-6"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </form>
            )}

            {/* OTP Verify Form */}
            {loginMethod === 'otp-verify' && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    One-Time Password
                  </label>
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={formData.otp}
                    onChange={handleFormData}
                    className="input-professional text-center text-2xl tracking-widest py-3"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>

                <div className="space-y-4 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full py-3 text-base font-semibold"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      "Verify & Login"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginMethod('otp')}
                    className="w-full text-sm text-[var(--primary)] hover:underline font-medium"
                  >
                    ← Change Email
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup" className="text-[var(--primary)] font-semibold hover:underline">
                  Sign Up
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
