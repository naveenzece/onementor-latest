"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { initiateGoogleLogin } from "@/services/auth/auth";
import MainHeader from "@/components/Header/mainHeader";
import Footer from "@/components/Footer/footer";
import Loader from "@/components/ui/loader/loader";
import { UserIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

export default function RoleSelection() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleRoleSelect = async (role) => {
        setLoading(true);
        const roleParam = role === 'coach' ? 'mentor' : 'user';
        const result = await initiateGoogleLogin(roleParam);
        if (result && result.error) {
            // Error handling if redirect fails
            console.error(result.error);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <MainHeader />

            <Loader isLoading={loading} message="Redirecting to Google..." />

            <main className="flex-grow flex items-center justify-center px-4 py-16 relative overflow-hidden">
                {/* Background Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/10 rounded-full blur-[100px]"></div>
                </div>

                <div className="max-w-4xl w-full text-center relative z-10">
                    <div className="mb-16 fade-in">
                        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
                            Join <span className="gradient-text">OneMentor</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Choose your role to continue your journey with Google
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10 items-stretch">
                        {/* Learner Option */}
                        <div
                            onClick={() => handleRoleSelect('user')}
                            className="group relative cursor-pointer fade-in-up transition-all duration-500 hover:scale-[1.03]"
                            style={{ animationDelay: '0.1s' }}
                        >
                            <div className="h-full p-10 bg-white/80 backdrop-blur-xl border border-white/20 rounded-[40px] shadow-2xl hover:shadow-blue-500/20 flex flex-col items-center text-center transition-all">
                                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mb-8 shadow-lg group-hover:rotate-6 transition-transform">
                                    <UserIcon className="w-14 h-14" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">Learner</h2>
                                <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                                    Connect with mentors and accelerate your personal growth journey.
                                </p>
                                <div className="mt-auto w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 group-hover:bg-blue-700 transition-all">
                                    I want to Learn
                                </div>
                            </div>
                        </div>

                        {/* Coach Option */}
                        <div
                            onClick={() => handleRoleSelect('coach')}
                            className="group relative cursor-pointer fade-in-up transition-all duration-500 hover:scale-[1.03]"
                            style={{ animationDelay: '0.2s' }}
                        >
                            <div className="h-full p-10 bg-white/80 backdrop-blur-xl border border-white/20 rounded-[40px] shadow-2xl hover:shadow-purple-500/20 flex flex-col items-center text-center transition-all">
                                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center mb-8 shadow-lg group-hover:-rotate-6 transition-transform">
                                    <AcademicCapIcon className="w-14 h-14" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">Coach</h2>
                                <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                                    Share your knowledge and help others while building your professional brand.
                                </p>
                                <div className="mt-auto w-full py-5 bg-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-purple-200 group-hover:bg-purple-700 transition-all">
                                    I want to Coach
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => router.back()}
                        className="mt-16 text-gray-400 hover:text-gray-900 font-semibold transition-all hover:tracking-widest flex items-center justify-center mx-auto space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back to Login</span>
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
}
