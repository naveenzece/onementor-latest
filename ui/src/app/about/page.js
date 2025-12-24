"use client";

import MainHeader from "@/components/Header/mainHeader";
import Footer from "@/components/Footer/footer";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
            About OneMentor
          </h1>
          
          <p className="text-lg lg:text-xl text-gray-600 mx-auto leading-relaxed">
            Empowering individuals through personalized mentorship and continuous growth
          </p>
        </div>

        {/* Mission Section */}
        <div className="card ml-6 mr-6  md:p-10 mb-12 md:mb-16 ">
          <div className="text-center ">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-base lg:text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto ">
              At OneMentor, we believe that everyone has the potential to achieve greatness. Our mission is to connect
              individuals with expert mentors who can guide them on their journey to personal and professional success.
              We're building a platform that makes quality mentorship accessible to everyone, regardless of their background or circumstances.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-10">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 p-20">

            {/* Excellence */}
            <div className="card text-center p-6 group hover:scale-105 transition-transform duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Excellence</h3>
              <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                We strive for excellence in everything we do, from the quality of our mentors to the user experience we provide.
              </p>
            </div>

            {/* Accessibility */}
            <div className="card text-center p-6 group hover:scale-105 transition-transform duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Accessibility</h3>
              <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                Quality mentorship should be accessible to everyone. We break down barriers and make expert guidance available to all.
              </p>
            </div>

            {/* Growth */}
            <div className="card text-center p-6 group hover:scale-105 transition-transform duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Growth</h3>
              <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                We believe in continuous learning and growth, both for our users and as an organization committed to improvement.
              </p>
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="card p-8 ml-6 mr-6 md:p-10 mb-12 md:mb-16">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
              <p className="text-base lg:text-lg text-gray-600 leading-relaxed mb-4">
                OneMentor was born from a simple observation: the most successful people in the world often credit their
                success to having great mentors. Yet, finding quality mentorship has traditionally been difficult,
                expensive, or limited to certain networks.
              </p>
              <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
                We set out to change that by creating a platform that connects individuals with verified expert mentors
                across various fields. Today, we're proud to have helped thousands of people achieve their goals through
                meaningful mentorship relationships.
              </p>
            </div>
            <div className="text-center">
              <div className="w-56 h-56 mx-auto rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-lg">
                <svg className="w-28 h-28 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>


        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Journey?</h2>
          <p className="text-base lg:text-lg text-gray-600 mb-4 mx-auto">
            Join thousands of individuals who have transformed their lives through quality mentorship
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn btn-primary px-8 py-3 text-base">
              Get Started Today
            </Link>
            <Link href="/contact" className="btn btn-secondary px-8 py-3 text-base">
              Contact Us
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
