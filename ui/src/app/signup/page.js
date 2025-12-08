"use client";

import MainHeader from "@/components/Header/mainHeader";
import Footer from "@/components/Footer/footer";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "@/services/user/user";
import { toastrSuccess, toastrError } from "@/components/ui/toaster/toaster";

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);

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
      } else if (response.message) {
        toastrSuccess(response.message || "Account created successfully! Please verify your email.");
        // Redirect to OTP verify page with email and role
        setTimeout(() => {
          const roleParam = formData.role === 'coach' ? 'coach' : 'user';
          router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}&role=${roleParam}`);
        }, 1000);
      } else {
        toastrError("Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      toastrError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
                Continuous Growth Platform
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800">
                Join Us Today!
              </h2>
              <p className="text-lg text-gray-600">
                Start your journey towards continuous growth and success
              </p>
            </div>
{/* 
            <div className="grid grid-cols-2 gap-6">
              <div className="card card-compact text-center">
                <div className="text-3xl lg:text-4xl font-bold text-[var(--primary)] mb-2">500+</div>
                <div className="text-sm text-gray-600">Expert Coaches</div>
              </div>
              <div className="card card-compact text-center">
                <div className="text-3xl lg:text-4xl font-bold text-[var(--primary)] mb-2">10K+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="card card-compact text-center">
                <div className="text-3xl lg:text-4xl font-bold text-[var(--primary)] mb-2">50K+</div>
                <div className="text-sm text-gray-600">Sessions Completed</div>
              </div>
              <div className="card card-compact text-center">
                <div className="text-3xl lg:text-4xl font-bold text-[var(--primary)] mb-2">4.9★</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div> */}

            <div className="space-y-5">
              <h3 className="font-semibold text-gray-800 text-xl">Why choose OneMentor?</h3>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-base">Verified professional coaches</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-base">Flexible scheduling options</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-base">AI-powered recommendations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-base">Secure payment processing</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="card glass-effect max-w-md w-full mx-auto spacing-extra-generous fade-in pt-8">
            <div className="text-center mb-10 md:mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] mb-6">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                Create Account
              </h2>
              <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
                Join thousands of learners and coaches
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-7">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-3">
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
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-3">
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
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-3">
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
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-3">
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-3">
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
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-3">
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
                className="btn btn-primary w-full py-4 text-lg font-semibold mt-8"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2" style={{width: '20px', height: '20px', borderWidth: '2px'}}></div>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="mt-10 pt-6 border-t border-gray-200 text-center">
              <p className="text-base text-gray-600">
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
