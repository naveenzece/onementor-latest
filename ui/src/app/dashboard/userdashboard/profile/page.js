"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SkillInput from "@/components/userprofile/SkillInput";
import InterestSelector from "@/components/userprofile/InterestSelector";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { toastrSuccess, toastrError } from "@/components/ui/toaster/toaster";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getUserProfile } from "@/services/user/user";

export default function ProfileSetup() {
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Calendar integration removed from profile; handled in booking flow

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const urlParams = new URLSearchParams(window.location.search);
    const isReturningFromCalendar = urlParams.get('calendar_connected') === 'true' || urlParams.get('calendar_error');

    let draftRestored = false;

    // Restore draft if returning from calendar connection
    if (isReturningFromCalendar) {
      const draft = localStorage.getItem('userProfileDraft');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          if (parsed.skills) setSkills(parsed.skills);
          if (parsed.interests) setInterests(parsed.interests);
          draftRestored = true;
          // Clear draft after restoring
          localStorage.removeItem('userProfileDraft');
        } catch (e) {
          console.error("Failed to parse user profile draft", e);
        }
      }
    }

    if (userId) {
      // Only fetch profile from DB if we didn't restore a draft
      // This prevents overwriting the user's in-progress edits
      if (!draftRestored) {
        fetchProfile(userId);
      }
    }
  }, []);

  // Fetch existing profile data
  const fetchProfile = async (userId) => {
    try {
      const response = await getUserProfile(userId);

      if (response.error) {
        // Profile doesn't exist yet, which is fine
        return;
      }

      // Prefill form with existing data
      if (response.skills) {
        const skillsData = typeof response.skills === 'string'
          ? JSON.parse(response.skills)
          : response.skills;
        setSkills(Array.isArray(skillsData) ? skillsData : []);
      }

      if (response.interests) {
        const interestsData = typeof response.interests === 'string'
          ? JSON.parse(response.interests)
          : response.interests;
        setInterests(Array.isArray(interestsData) ? interestsData : []);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // Calendar integration moved to booking flow (see booking page)

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!skills.length || !interests.length) {
      toastrError("Please fill skills and interests fields.");
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

    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8001';
      const res = await fetch(`${API_BASE}/api/profile`, {
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
              <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-semibold">
                2
              </div>
              <span className="font-semibold text-gray-500">Complete</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] h-2 rounded-full" style={{ width: '100%' }}></div>
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
                  <div className="spinner mr-2" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
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
