"use client";

import MainHeader from "@/components/Header/mainHeader";
import Footer from "@/components/Footer/footer";
import Image from "next/image";
import { useState } from "react";

export default function FAQPage() {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqCategories = [
    {
      title: "Getting Started",
      icon: "🚀",
      questions: [
        {
          question: "How do I create an account on OneMentor?",
          answer: "Creating an account is simple! Click the 'Sign Up' button on our homepage, enter your email address, and follow the verification process. You'll then be guided through setting up your profile."
        },
        {
          question: "What information do I need to provide during signup?",
          answer: "We'll ask for your basic information like name, email, phone number, and your areas of interest or goals. This helps us match you with the right coaches."
        },
        {
          question: "Is OneMentor free to use?",
          answer: "OneMentor offers both free and paid options. Our AI Coach is completely free and available 24/7. Human coach sessions start from ₹1000 per session. Creating an account and browsing coaches is always free."
        }
      ]
    },
    {
      title: "AI Coach",
      icon: "🤖",
      questions: [
        {
          question: "What is the AI Coach?",
          answer: "Our AI Coach is a free, 24/7 available artificial intelligence system that provides instant guidance, personalized recommendations, and progress tracking. It's completely free to use."
        },
        {
          question: "How does the AI Coach work?",
          answer: "The AI Coach uses advanced AI technology to understand your goals and challenges, then provides personalized advice and recommendations. You can interact with it anytime through our platform."
        },
        {
          question: "Is the AI Coach really free?",
          answer: "Yes! The AI Coach is completely free with no hidden charges, subscriptions, or usage limits. You can use it as much as you want."
        },
        {
          question: "Can the AI Coach replace human coaches?",
          answer: "The AI Coach provides excellent instant guidance and is perfect for quick questions and ongoing support. However, human coaches offer deeper, more personalized mentorship for complex challenges and long-term development."
        }
      ]
    },
    {
      title: "Booking Sessions",
      icon: "📅",
      questions: [
        {
          question: "How do I book a coaching session?",
          answer: "Browse available coaches, select one that matches your needs, choose an available time slot, and complete the booking process. You'll receive a confirmation email with session details."
        },
        {
          question: "Can I reschedule or cancel a session?",
          answer: "Yes! You can reschedule or cancel sessions up to 24 hours before the scheduled time. Cancellations within 24 hours may incur a partial fee. Check our cancellation policy for details."
        },
        {
          question: "What types of sessions are available?",
          answer: "We offer one-on-one coaching sessions in various durations (30, 60, or 90 minutes). Each coach specializes in different areas and may offer different session lengths based on their expertise."
        },
        {
          question: "How long are typical coaching sessions?",
          answer: "Most sessions are 60 minutes, but some coaches offer 30-minute or 90-minute sessions. The duration will be clearly indicated when you book."
        }
      ]
    },
    {
      title: "Coaching Experience",
      icon: "🎯",
      questions: [
        {
          question: "How are coaches verified on OneMentor?",
          answer: "All coaches go through a rigorous verification process including background checks, credential verification, and platform training. We ensure they meet our high standards for expertise and professionalism."
        },
        {
          question: "What if I'm not satisfied with my coach?",
          answer: "We want you to have a great experience! If you're not satisfied, contact our support team within 48 hours of your session. We'll work with you to find a better match or provide a refund."
        },
        {
          question: "Can I choose my own coach?",
          answer: "Absolutely! You can browse all available coaches, read their profiles, reviews, and specialties, then choose the one that best fits your needs and goals."
        },
        {
          question: "What should I prepare for my first session?",
          answer: "Think about your goals, challenges, and what you hope to achieve. Have any relevant documents ready, and ensure you have a quiet space with good internet connection for video sessions."
        }
      ]
    },
    {
      title: "Payment & Billing",
      icon: "💳",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely through our encrypted payment system."
        },
        {
          question: "When will I be charged for a session?",
          answer: "Payment is required at the time of booking. Your card will be charged immediately when you confirm your session booking."
        },
        {
          question: "Do you offer refunds?",
          answer: "Yes, we offer refunds based on our cancellation policy. Full refunds for cancellations 24+ hours in advance, 50% refund for cancellations within 24 hours, and full refunds for technical issues on our end."
        },
        {
          question: "Can I get a receipt for my sessions?",
          answer: "Yes! You'll receive an email receipt immediately after payment, and you can access all your receipts in your account dashboard under 'Billing History'."
        }
      ]
    },
    {
      title: "Technical Support",
      icon: "🔧",
      questions: [
        {
          question: "What if I have technical issues during a session?",
          answer: "If you experience technical problems, try refreshing your browser or checking your internet connection. If issues persist, contact our support team immediately - we'll help resolve the problem or reschedule your session."
        },
        {
          question: "What devices can I use for sessions?",
          answer: "You can use any device with a web browser - desktop computers, laptops, tablets, or smartphones. We recommend using Chrome, Firefox, or Safari for the best experience."
        },
        {
          question: "Do I need to download any software?",
          answer: "No downloads required! All sessions take place in your web browser. Just make sure you have a working camera and microphone for video sessions."
        },
        {
          question: "How do I test my audio and video before a session?",
          answer: "We provide a pre-session test tool. You'll see a 'Test Audio/Video' button when you join your session room. We recommend testing 5-10 minutes before your scheduled time."
        }
      ]
    },
    {
      title: "Account Management",
      icon: "👤",
      questions: [
        {
          question: "How do I update my profile information?",
          answer: "Go to your account dashboard, click on 'Profile Settings', and update any information you'd like to change. Don't forget to save your changes!"
        },
        {
          question: "Can I change my password?",
          answer: "Yes! In your account settings, go to 'Security' and click 'Change Password'. You'll need to enter your current password and create a new one."
        },
        {
          question: "How do I delete my account?",
          answer: "To delete your account, go to 'Account Settings' and scroll to the bottom. Click 'Delete Account' and follow the confirmation process. Note: This action cannot be undone."
        },
        {
          question: "Can I have multiple accounts?",
          answer: "We recommend using one account per person. Having multiple accounts may violate our terms of service and could result in account suspension."
        }
      ]
    }
  ];

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
            Frequently Asked Questions
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Find answers to common questions about OneMentor
          </p>
        </div>

        {/* Search Section */}
        <div className="card spacing-generous mb-12 md:mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Search FAQ</h2>
            <p className="text-gray-600">Can't find what you're looking for? Search our FAQ database</p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for answers..."
                className="input-professional pr-12"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-12 md:space-y-16">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="card spacing-generous">
              <div className="flex items-center mb-8">
                <div className="text-4xl mr-4">{category.icon}</div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{category.title}</h2>
              </div>
              
              <div className="space-y-4">
                {category.questions.map((item, itemIndex) => {
                  const globalIndex = `${categoryIndex}-${itemIndex}`;
                  const isOpen = openItems[globalIndex];
                  
                  return (
                    <div key={itemIndex} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                      >
                        <span className="text-lg font-semibold text-gray-900 pr-4">
                          {item.question}
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <div className="border-t border-gray-200 pt-4">
                            <p className="text-gray-600 leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Need Help */}
        <div className="mt-16 md:mt-20 mb-8">
          <div className="card spacing-generous text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Still Need Help?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our support team is here to help you with any questions or issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="btn btn-primary btn-lg px-8 py-4">
                Contact Support
              </a>
              <a href="/help" className="btn btn-secondary btn-lg px-8 py-4">
                Browse Help Center
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
