"use client";

import MainHeader from "@/components/Header/mainHeader";
import Footer from "@/components/Footer/footer";
import Image from "next/image";

export default function Features() {
  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />

      <main className="flex-grow py-4 md:py-8 fade-in">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block mb-6">
            <Image
              src="/images/onementor.jpg"
              alt="OneMentor"
              width={100}
              height={100}
              className="rounded-full border-4 border-[var(--primary)] shadow-xl mx-auto"
            />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold gradient-text mb-4">
            OneMentor Features
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the powerful features that make OneMentor the ultimate platform for continuous growth and professional development.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">

          {/* Expert Coaches */}
          <div className="card text-center p-6 group hover:scale-105 transition-transform duration-300">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Human Coaches</h3>
            <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
              Connect with verified human professionals and industry experts who provide personalized mentorship starting from ₹1000 per session.
            </p>
          </div>

          {/* Flexible Scheduling */}
          <div className="card text-center p-6 group hover:scale-105 transition-transform duration-300">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Flexible Scheduling</h3>
            <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
              Book sessions that fit your schedule with our intuitive calendar system. Available 24/7 to accommodate your busy lifestyle.
            </p>
          </div>

          {/* AI-Powered Insights */}
          <div className="card text-center p-6 group hover:scale-105 transition-transform duration-300">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Free AI Coach</h3>
            <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
              Get instant guidance and personalized recommendations from our AI Coach, available 24/7 at no cost.
            </p>
          </div>

          {/* Progress Tracking */}
          <div className="card text-center p-6 group hover:scale-105 transition-transform duration-300">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Progress Tracking</h3>
            <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
              Monitor your growth with detailed analytics and progress reports that help you stay on track toward your goals.
            </p>
          </div>

          {/* Secure Communication */}
          <div className="card text-center p-6 group hover:scale-105 transition-transform duration-300">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Communication</h3>
            <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
              Communicate safely with your coaches through our encrypted platform, ensuring your privacy and data security.
            </p>
          </div>

          {/* Community Support */}
          <div className="card text-center p-6 group hover:scale-105 transition-transform duration-300">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">24/7 Support</h3>
            <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
              Get help whenever you need it with our dedicated support team. We're here to ensure your coaching experience is smooth and successful.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        {/* <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Join Thousands of Successful Learners</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-lg opacity-90">Expert Coaches</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
              <div className="text-lg opacity-90">Active Users</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50K+</div>
              <div className="text-lg opacity-90">Sessions Completed</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">4.9★</div>
              <div className="text-lg opacity-90">Average Rating</div>
            </div>
          </div>
        </div> */}
      </main>

      <Footer />
    </div>
  );
}
