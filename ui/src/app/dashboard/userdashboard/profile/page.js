"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SkillInput from "@/components/userprofile/SkillInput";
import InterestSelector from "@/components/userprofile/InterestSelector";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { toastrSuccess, toastrError } from "@/components/ui/toaster/toaster";
import { ArrowLeftIcon, DocumentArrowUpIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function ProfileSetup() {
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResumeChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!skills.length || !interests.length || !resume) {
      toastrError("Please fill all fields and upload your resume.");
      return;
    }

    // Get user_id from localStorage
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toastrError("User ID not found. Please login again.");
      router.push("/login");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", userId); // Add user_id to FormData
    formData.append("skills", JSON.stringify(skills));
    formData.append("interests", JSON.stringify(interests));
    formData.append("resume", resume);

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8001/api/profile", {
        method: "POST",
        credentials: 'include', // Include cookies for session
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      toastrSuccess(result.message || "Profile submitted successfully!");
      console.log("Profile submission response:", result);

      setTimeout(() => {
        router.push("/dashboard/user");
      }, 1500);
    } catch (err) {
      console.error("Error submitting profile:", err);
      toastrError(err.message || "Error submitting profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow container-professional py-8 md:py-10 lg:py-12 fade-in">
        {/* Header Section */}
        <div className="mb-10 md:mb-12">
          <button
            onClick={() => router.push("/dashboard/user")}
            className="flex items-center text-gray-600 hover:text-[var(--primary)] mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 text-lg">
            Help us match you with the perfect coaches by sharing your skills and interests
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="card p-6 mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-semibold">
                1
              </div>
              <span className="font-semibold text-gray-900">Skills & Interests</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-semibold">
                2
              </div>
              <span className="font-semibold text-gray-900">Upload Resume</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-semibold">
                3
              </div>
              <span className="font-semibold text-gray-500">Complete</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] h-2 rounded-full" style={{width: '66%'}}></div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Skills Section */}
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Your Skills</h2>
                  <p className="text-sm text-gray-600">Add your current skills and expertise</p>
                </div>
              </div>
              <SkillInput skills={skills} setSkills={setSkills} />
            </div>

            {/* Interests Section */}
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Your Interests</h2>
                  <p className="text-sm text-gray-600">What areas do you want to explore?</p>
                </div>
              </div>
              <InterestSelector interests={interests} setInterests={setInterests} />
            </div>
          </div>

          {/* Resume Upload Section */}
          <div className="card p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                <DocumentArrowUpIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Upload Resume</h2>
                <p className="text-sm text-gray-600">Share your professional background (PDF, DOC, DOCX)</p>
              </div>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[var(--primary)] transition-colors">
              <input
                type="file"
                id="resume"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeChange}
                className="hidden"
              />
              <label htmlFor="resume" className="cursor-pointer">
                {resume ? (
                  <div className="space-y-2">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                    <p className="text-lg font-semibold text-gray-900">{resume.name}</p>
                    <p className="text-sm text-gray-500">Click to change file</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <DocumentArrowUpIcon className="w-16 h-16 text-gray-400 mx-auto" />
                    <p className="text-lg font-semibold text-gray-700">Click to upload your resume</p>
                    <p className="text-sm text-gray-500">PDF, DOC, or DOCX (Max 5MB)</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => router.push("/dashboard/user")}
              className="btn btn-secondary px-8 py-3"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary px-8 py-3"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="spinner mr-2" style={{width: '20px', height: '20px', borderWidth: '2px'}}></div>
                  Saving Profile...
                </div>
              ) : (
                "Save Profile"
              )}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
