"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SkillInput from "@/components/userprofile/SkillInput";
import InterestSelector from "@/components/userprofile/InterestSelector";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { toastrSuccess, toastrError } from "@/components/ui/toaster/toaster";
import { ArrowLeftIcon, DocumentArrowUpIcon, CheckCircleIcon, CalendarIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { getCalendarAuthUrl, getCalendarStatus, disconnectCalendar } from "@/services/calendar/userCalendar";
import { getUserProfile } from "@/services/user/user";

export default function ProfileSetup() {
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [resume, setResume] = useState(null);
  const [existingResume, setExistingResume] = useState(null); // Store existing resume filename
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Calendar connection state
  const [calendarStatus, setCalendarStatus] = useState({
    connected: false,
    email: null,
    connectedAt: null,
    loading: true
  });

  useEffect(() => {
    // Fetch existing profile and calendar status
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchProfile(userId);
      fetchCalendarStatus(userId);
    }

    // Check for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('calendar_connected') === 'true') {
      toastrSuccess('Google Calendar connected successfully!');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      if (userId) {
        fetchCalendarStatus(userId);
      }
    }
    if (urlParams.get('calendar_error')) {
      toastrError(`Calendar connection failed: ${urlParams.get('calendar_error')}`);
      window.history.replaceState({}, document.title, window.location.pathname);
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
      
      if (response.resume) {
        // Store existing resume filename for display
        setExistingResume(response.resume);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // Calendar connection functions
  const fetchCalendarStatus = async (userId) => {
    try {
      setCalendarStatus(prev => ({ ...prev, loading: true }));
      const response = await getCalendarStatus(userId);
      
      if (response.error) {
      setCalendarStatus({
        connected: false,
        email: null,
        connectedAt: null,
        loading: false
      });
        return;
      }

      setCalendarStatus({
        connected: response.connected || false,
        email: response.email || null,
        connectedAt: response.connectedAt || null,
        loading: false
      });
    } catch (error) {
      console.error("Error fetching calendar status:", error);
      setCalendarStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const handleConnectCalendar = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toastrError("User not found. Please login again.");
      return;
    }

    try {
      const response = await getCalendarAuthUrl(userId);
      
      if (response.error) {
        toastrError(response.error || "Failed to get authorization URL");
        return;
      }

      // Redirect to Google OAuth
      window.location.href = response.authUrl;
    } catch (error) {
      console.error("Error connecting calendar:", error);
      toastrError("Failed to initiate calendar connection");
    }
  };


  const handleDisconnectCalendar = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toastrError("User not found. Please login again.");
      return;
    }

    if (!confirm("Are you sure you want to disconnect Google Calendar? You'll need to reconnect to use calendar features.")) {
      return;
    }

    try {
      const response = await disconnectCalendar(userId);
      
      if (response.error) {
        toastrError(response.error || "Failed to disconnect calendar");
        return;
      }

      toastrSuccess("Google Calendar disconnected successfully");
      await fetchCalendarStatus(userId);
    } catch (error) {
      console.error("Error disconnecting calendar:", error);
      toastrError("Failed to disconnect calendar");
    }
  };

  const handleResumeChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!skills.length || !interests.length) {
      toastrError("Please fill skills and interests fields.");
      return;
    }

    // Resume is optional if there's an existing one
    if (!resume && !existingResume) {
      toastrError("Please upload your resume.");
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
    // Only append resume if a new file is selected
    if (resume) {
      formData.append("resume", resume);
    }

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
                ) : existingResume ? (
                  <div className="space-y-2">
                    <CheckCircleIcon className="w-16 h-16 text-blue-500 mx-auto" />
                    <p className="text-lg font-semibold text-gray-900">Current Resume: {existingResume}</p>
                    <p className="text-sm text-gray-500">Click to upload a new resume</p>
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

          {/* Google Calendar Integration */}
          <div className="card p-6">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mr-3">
                <CalendarIcon className="w-7 h-7 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Google Calendar Integration</h2>
                <p className="text-sm text-gray-600">Connect your calendar to receive session reminders and meeting links</p>
              </div>
            </div>

            {calendarStatus.loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="spinner" style={{width: '24px', height: '24px', borderWidth: '3px'}}></div>
                <span className="ml-3 text-gray-600">Checking calendar status...</span>
              </div>
            ) : calendarStatus.connected ? (
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">Calendar Connected</p>
                    <p className="text-sm text-green-700">
                      {calendarStatus.email && `Connected to: ${calendarStatus.email}`}
                      {calendarStatus.connectedAt && ` • Connected on ${new Date(calendarStatus.connectedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleDisconnectCalendar}
                    className="btn btn-secondary px-6 py-2 flex items-center text-red-600 hover:bg-red-50"
                  >
                    <XCircleIcon className="w-5 h-5 mr-2" />
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-700 mb-2">
                    Connect your Google Calendar to:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-2">
                    <li>Receive calendar invites for booked sessions</li>
                    <li>Get Google Meet links automatically</li>
                    <li>Sync session times with your calendar</li>
                    <li>Never miss a session with automatic reminders</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={handleConnectCalendar}
                  className="btn btn-primary px-6 py-3 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Connect Google Calendar
                </button>
              </div>
            )}
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
