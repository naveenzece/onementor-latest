"use client";

import MainHeader from "@/components/Header/mainHeader";
import Footer from "@/components/Footer/footer";
import Image from "next/image";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <MainHeader />

      <main className="flex-grow container-professional py-16 md:py-20 lg:py-24 fade-in">
        {/* Hero Section */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-block mb-8">
            <Image 
              src="/images/onementor.jpg"
              alt="OneMentor"
              width={120}
              height={120}
              className="rounded-full border-4 border-[var(--primary)] shadow-xl mx-auto"
            />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text mb-6">
            Terms and Conditions
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Please read these terms carefully before using OneMentor
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Terms Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Introduction */}
          <div className="card spacing-generous">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">1. Introduction</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                Welcome to OneMentor ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your use of our 
                mentorship platform and services. By accessing or using OneMentor, you agree to be bound by these Terms.
              </p>
              <p className="text-gray-600 leading-relaxed">
                If you do not agree to these Terms, please do not use our services. We reserve the right to modify these 
                Terms at any time, and your continued use of our services constitutes acceptance of any changes.
              </p>
            </div>
          </div>

          {/* Acceptance of Terms */}
          <div className="card spacing-generous">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">2. Acceptance of Terms</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                By creating an account, booking sessions, or using any of our services, you acknowledge that you have read, 
                understood, and agree to be bound by these Terms and our Privacy Policy.
              </p>
              <p className="text-gray-600 leading-relaxed">
                You must be at least 18 years old to use our services. If you are under 18, you may only use our services 
                with the involvement and consent of a parent or guardian.
              </p>
            </div>
          </div>

          {/* User Accounts */}
          <div className="card spacing-generous">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">3. User Accounts</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                To access certain features of our platform, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 ml-4">
                <li>Providing accurate and complete information</li>
                <li>Maintaining the security of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activity.
              </p>
            </div>
          </div>

          {/* Services Description */}
          <div className="card spacing-generous">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">4. Services Description</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                OneMentor provides a platform that connects users with professional coaches and mentors. Our services include:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 ml-4">
                <li>Matching users with qualified coaches</li>
                <li>Scheduling and managing coaching sessions</li>
                <li>Providing communication tools for sessions</li>
                <li>Processing payments for coaching services</li>
                <li>Offering AI-powered insights and recommendations</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                We do not guarantee specific outcomes from coaching sessions, as results depend on individual effort and circumstances.
              </p>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="card spacing-generous">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">5. Payment Terms</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                Payment for coaching sessions is required in advance. We accept various payment methods as specified on our platform.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Refund Policy:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 ml-4">
                <li>Cancellations made 24+ hours before session: Full refund</li>
                <li>Cancellations made less than 24 hours before session: 50% refund</li>
                <li>No-shows: No refund</li>
                <li>Technical issues on our end: Full refund</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                All prices are in USD unless otherwise specified. We reserve the right to change pricing with 30 days notice.
              </p>
            </div>
          </div>

          {/* User Conduct */}
          <div className="card spacing-generous">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">6. User Conduct</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 ml-4">
                <li>Use our services for any unlawful purpose</li>
                <li>Harass, abuse, or harm other users or coaches</li>
                <li>Share false or misleading information</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the proper functioning of our platform</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                Violations may result in immediate termination of your account and legal action.
              </p>
            </div>
          </div>

          {/* Intellectual Property */}
          <div className="card spacing-generous">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">7. Intellectual Property</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                All content on OneMentor, including text, graphics, logos, and software, is owned by us or our licensors 
                and is protected by copyright and other intellectual property laws.
              </p>
              <p className="text-gray-600 leading-relaxed">
                You may not reproduce, distribute, or create derivative works from our content without written permission. 
                You retain ownership of content you create, but grant us a license to use it in connection with our services.
              </p>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div className="card spacing-generous">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">8. Limitation of Liability</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                To the maximum extent permitted by law, OneMentor shall not be liable for any indirect, incidental, 
                special, or consequential damages arising from your use of our services.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our total liability for any claims shall not exceed the amount you paid for the specific service giving 
                rise to the claim in the 12 months preceding the claim.
              </p>
            </div>
          </div>

          {/* Termination */}
          <div className="card spacing-generous">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">9. Termination</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                Either party may terminate this agreement at any time. We may suspend or terminate your account immediately 
                if you violate these Terms.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Upon termination, your right to use our services ceases immediately. We may delete your account and data 
                in accordance with our Privacy Policy.
              </p>
            </div>
          </div>

          {/* Governing Law */}
          <div className="card spacing-generous">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">10. Governing Law</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed">
                These Terms are governed by the laws of [Your Jurisdiction]. Any disputes arising from these Terms or 
                your use of our services shall be resolved in the courts of [Your Jurisdiction].
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card spacing-generous mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">11. Contact Information</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Email:</strong> prwebinfo2024@gmail.com</p>
                <p className="text-gray-700 mb-2"><strong>Address:</strong> Tirunelveli</p>
                <p className="text-gray-700"><strong>Phone:</strong> 7397 392 888</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

