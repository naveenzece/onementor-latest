"use client";

import MainHeader from "@/components/Header/mainHeader";
import Footer from "@/components/Footer/footer";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "@/services/user/user";
import { initiateGoogleLogin } from "@/services/auth/auth";
import { toastrSuccess, toastrError } from "@/components/ui/toaster/toaster";
import Loader from "@/components/ui/loader/loader";

export default function Signup() {
  const router = useRouter();
  // Using useSearchParams from next/navigation might be cleaner, but current setup works
  // Let's add useSearchParams
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);

  // Check for error on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      const error = new URLSearchParams(window.location.search).get('error');
      if (error) {
        // Use setTimeout to ensure toastr library is ready/mounted effectively by react logic
        setTimeout(() => toastrError(decodeURIComponent(error)), 500);
        // Clean URL? Optional.
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, role } = formData;

    if (!name || !email || !password || !role) {
      toastrError("Please fill all required fields!");
      return;
    }

    if (password.length < 6) {
      toastrError("Password must be at least 6 characters long!");
      return;
    }

    if (password !== confirmPassword) {
      toastrError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const signupData = {
        name,
        email,
        phone: formData.phone || null,
        password,
        role: role === 'coach' ? 'mentor' : 'user' // Map 'coach' to 'mentor'
      };

      const response = await createUser(signupData);

      if (response.error) {
        toastrError(response.error);
        setLoading(false);
      } else if (response.message) {
        toastrSuccess(response.message || "Account created successfully! Please verify your email.");
        // Redirect to OTP verify page with email and role - keep loader visible during redirect
        setTimeout(() => {
          const roleParam = formData.role === 'coach' ? 'coach' : 'user';
          router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}&role=${roleParam}`);
        }, 1000);
        // Don't set loading to false - keep it visible during redirect
      } else {
        toastrError("Signup failed");
        setLoading(false);
      }
    } catch (err) {
      console.error("Signup error:", err);
      toastrError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Navigate to role selection page instead of validating here
    router.push("/auth/role-selection");
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      <MainHeader />

      <Loader isLoading={loading} message="Creating Account..." />

      <main className="flex-grow flex items-center justify-center px-4 py-12 md:py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 md:gap-12 items-start">

          {/* Left Side - Information */}
          <div className="hidden md:flex flex-col justify-start space-y-8 fade-in pt-4">
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

            <div className="space-y-4 text-center">
              <h2 className="text-xl lg:text-2xl font-semibold text-gray-800">
                Join Us Today!
              </h2>
              <p className="text-base text-gray-600">
                Start your journey towards continuous growth and success
              </p>
            </div>

            <div className="space-y-4 pt-4 max-w-sm mx-auto w-full">
              <h3 className="font-semibold text-gray-800 text-lg">Why choose OneMentor?</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600 text-sm md:text-base">Verified professional coaches</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600 text-sm md:text-base">Flexible scheduling options</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600 text-sm md:text-base">AI-powered recommendations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600 text-sm md:text-base">Secure payment processing</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="card glass-effect max-w-md w-full mx-auto p-8 fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Create Account
              </h2>
              <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                Join thousands of learners and coaches
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-professional"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-professional"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-professional"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-professional"
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-professional"
                  placeholder="Re-enter your password"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1.5">
                  I want to join as <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-professional"
                  required
                >
                  <option value="">Select your role</option>
                  <option value="user">Learner / Mentee</option>
                  <option value="coach">Coach / Mentor</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3 text-base font-semibold mt-6"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] transition-all"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l2.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84c.87-2.6 3.3-4.5 6.16-4.5z"
                  fill="#EA4335"
                />
              </svg>
              <span>Google</span>
            </button>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-[var(--primary)] font-semibold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>

            <div className="mt-6 text-xs text-center text-gray-500 leading-relaxed">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-[var(--primary)] hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[var(--primary)] hover:underline">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
