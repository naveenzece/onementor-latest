"use client";

import MainHeader from "@/components/Header/mainHeader";
import Footer from "@/components/Footer/footer";
import Image from "next/image";

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Privacy Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Introduction */}
          <div className="card spacing-generous">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">1. Introduction</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                OneMentor ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains 
                how we collect, use, disclose, and safeguard your information when you use our mentorship platform.
              </p>
              <p className="text-gray-600 leading-relaxed">
                By using our services, you consent to the collection and use of information in accordance with this policy. 
                If you do not agree with our policies and practices, please do not use our services.
              </p>
            </div>
          </div>

          {/* Information We Collect */}
          <div className="card spacing-generous">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="prose prose-lg max-w-none mb-6">
              <p className="text-gray-600 leading-relaxed mb-4">
                We collect information you provide directly to us, such as:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 ml-4">
                <li>Name, email address, and phone number</li>
                <li>Profile information and preferences</li>
                <li>Payment information (processed securely by third-party providers)</li>
                <li>Communication records with coaches</li>
                <li>Session recordings (with your consent)</li>
                <li>Feedback and reviews</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Usage Information</h3>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                We automatically collect certain information about your use of our services:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 ml-4">
                <li>Device information and IP address</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent on our platform</li>
                <li>Session data and preferences</li>
                <li>Error logs and performance data</li>
              </ul>
            </div>
          </div>

          {/* How We Use Information */}
          <div className="card spacing-generous">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">3. How We Use Your Information</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 ml-4">
                <li>Provide and maintain our mentorship services</li>
                <li>Match you with appropriate coaches</li>
                <li>Process payments and manage billing</li>
                <li>Communicate with you about your account and sessions</li>
                <li>Improve our platform and develop new features</li>
                <li>Provide customer support</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </div>

          {/* Information Sharing */}
          <div className="card spacing-generous">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">4. Information Sharing and Disclosure</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 ml-4">
                <li><strong>With Coaches:</strong> Basic profile information to facilitate mentorship</li>
                <li><strong>Service Providers:</strong> Trusted third parties who assist in operating our platform</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
                <li><strong>Consent:</strong> When you explicitly consent to sharing</li>
              </ul>
            </div>
          </div>

          {/* Data Security */}
          <div className="card spacing-generous">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">5. Data Security</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                We implement appropriate security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security audits and updates</li>
                <li>Employee training on data protection</li>
                <li>Incident response procedures</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                However, no method of transmission over the internet is 100% secure. While we strive to protect your information, 
                we cannot guarantee absolute security.
              </p>
            </div>
          </div>

          {/* Data Retention */}
          <div className="card spacing-generous">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">6. Data Retention</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 ml-4">
                <li>Provide our services to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Improve our services</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                When you delete your account, we will delete or anonymize your personal information, except where retention 
                is required by law or for legitimate business purposes.
              </p>
            </div>
          </div>

          {/* Your Rights */}
          <div className="card spacing-generous">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">7. Your Rights and Choices</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Objection:</strong> Object to certain processing activities</li>
                <li><strong>Restriction:</strong> Request limitation of processing</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                To exercise these rights, please contact us at privacy@onementor.com. We will respond to your request 
                within 30 days.
              </p>
            </div>
          </div>

          {/* Cookies and Tracking */}
          <div className="card spacing-generous">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">8. Cookies and Tracking Technologies</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand usage patterns</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Marketing Cookies:</strong> Used for targeted advertising (with consent)</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                You can control cookie settings through your browser preferences. Note that disabling certain cookies 
                may affect platform functionality.
              </p>
            </div>
          </div>

          {/* Third-Party Services */}
          <div className="card spacing-generous">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">9. Third-Party Services</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                Our platform may contain links to third-party websites or integrate with third-party services. 
                These services have their own privacy policies, and we are not responsible for their practices.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We use trusted third-party services for:
              </p>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 ml-4">
                <li>Payment processing</li>
                <li>Email communications</li>
                <li>Analytics and monitoring</li>
                <li>Cloud storage and hosting</li>
              </ul>
            </div>
          </div>

          {/* Children's Privacy */}
          <div className="card spacing-generous">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">10. Children's Privacy</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed">
                Our services are not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13. If we become aware that we have collected personal 
                information from a child under 13, we will take steps to delete such information.
              </p>
            </div>
          </div>

          {/* International Transfers */}
          <div className="card spacing-generous">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">11. International Data Transfers</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. 
                We ensure appropriate safeguards are in place to protect your information in accordance with applicable 
                data protection laws.
              </p>
            </div>
          </div>

          {/* Changes to Privacy Policy */}
          <div className="card spacing-generous">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">12. Changes to This Privacy Policy</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review 
                this Privacy Policy periodically for any changes.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card spacing-generous mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">13. Contact Us</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Email:</strong>prwebinfo2024@gmail.com</p>
                <p className="text-gray-700 mb-2"><strong>Address:</strong> Tirunelveli</p>
                <p className="text-gray-700"><strong>Phone:</strong>7397 392 888</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

