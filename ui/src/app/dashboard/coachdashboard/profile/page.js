"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SkillInput from "@/components/coach/profile/SkillsInput";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { toastrSuccess, toastrError } from "@/components/ui/toaster/toaster";
import { ArrowLeftIcon, UserCircleIcon, AcademicCapIcon, DocumentTextIcon, CalendarIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { createMentorProfile, getMentorProfile } from "@/services/mentor/mentor";
import { getCalendarAuthUrl, getCalendarStatus, disconnectCalendar } from "@/services/calendar/calendar";

const ProfileForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Mapping of short forms to full expertise text
  const expertiseMapping = {
    "fitness": "Fitness & Wellness",
    "career": "Career Development",
    "life": "Life Coaching",
    "business": "Business & Entrepreneurship",
    "tech": "Technology & Programming",
    "finance": "Finance & Investment"
  };

  // Reverse mapping for loading existing profiles
  const expertiseReverseMapping = {
    "Fitness & Wellness": "fitness",
    "Career Development": "career",
    "Life Coaching": "life",
    "Business & Entrepreneurship": "business",
    "Technology & Programming": "tech",
    "Finance & Investment": "finance"
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    expertise: "",
    customExpertise: "",
    bio: "",
    skills: [],
    slots: [],
  });

  // Calendar connection state
  const [calendarStatus, setCalendarStatus] = useState({
    connected: false,
    email: null,
    connectedAt: null,
    loading: true
  });

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const urlParams = new URLSearchParams(window.location.search);
    const isReturningFromCalendar = urlParams.get('calendar_connected') === 'true' || urlParams.get('calendar_error');

    let draftRestored = false;

    // Restore draft if returning from calendar connection
    if (isReturningFromCalendar) {
      const draft = localStorage.getItem('coachProfileDraft');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setFormData(parsed);
          draftRestored = true;
          // Clear draft after restoring
          localStorage.removeItem('coachProfileDraft');
        } catch (e) {
          console.error("Failed to parse coach profile draft", e);
        }
      }
    }

    if (userId) {
      // Only fetch profile from DB if we didn't restore a draft
      if (!draftRestored) {
        fetchProfile(userId);
      }
      fetchCalendarStatus(userId);
    }

    if (urlParams.get('calendar_connected') === 'true') {
      toastrSuccess('Google Calendar connected successfully!');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (urlParams.get('calendar_error')) {
      toastrError(`Calendar connection failed: ${urlParams.get('calendar_error')}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const response = await getMentorProfile(userId);

      if (response.error) {
        // User not found or not a mentor
        return;
      }

      const data = response;
      const category = data.category || "";
      // Check if category is one of the predefined full text options or short forms
      const predefinedShortForms = ["fitness", "career", "life", "business", "tech", "finance"];
      const predefinedFullTexts = Object.keys(expertiseReverseMapping);
      const isShortForm = predefinedShortForms.includes(category);
      const isFullText = predefinedFullTexts.includes(category);
      const isCustom = category && !isShortForm && !isFullText;

      // Convert full text to short form if needed, or use short form directly
      const shortForm = isFullText ? expertiseReverseMapping[category] : (isShortForm ? category : null);

      setFormData({
        // Fallback to u.name from users table if mp.username is missing
        name: data.username || data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        expertise: isCustom ? "other" : (shortForm || ""),
        customExpertise: isCustom ? (category || "") : "",
        bio: data.bio || "",
        skills: data.skills ? (typeof data.skills === 'string' ? JSON.parse(data.skills) : data.skills) : [],
        slots: [],
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "expertise" && value !== "other") {
      // Clear custom expertise when switching away from "other"
      setFormData({ ...formData, [name]: value, customExpertise: "" });
    } else {
      // Ensure customExpertise is always a string
      const updatedValue = name === "customExpertise" ? (value || "") : value;
      setFormData({ ...formData, [name]: updatedValue });
    }
  };

  const handleSkillsChange = (skills) => {
    setFormData({ ...formData, skills });
  };

  const handleSlotsChange = (slots) => {
    setFormData({ ...formData, slots });
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
          loading: false,
          testing: false
        });
        return;
      }

      setCalendarStatus({
        connected: response.connected || false,
        email: response.email || null,
        connectedAt: response.connectedAt || null,
        loading: false,
        testing: false
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
      // Save form state to localStorage before redirecting
      localStorage.setItem('coachProfileDraft', JSON.stringify(formData));

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("userId");
    if (!userId) {
      toastrError("User not found. Please login again.");
      router.push("/login");
      return;
    }

    // Validate Google Calendar connection
    if (!calendarStatus.connected) {
      toastrError("Please connect your Google Calendar to proceed");
      return;
    }

    // Validate custom expertise if "other" is selected
    if (formData.expertise === "other") {
      if (!formData.customExpertise || formData.customExpertise.trim() === "") {
        toastrError("Please enter your expertise");
        return;
      }
    }

    const formDataObj = new FormData();
    formDataObj.append("user_id", userId);
    formDataObj.append("username", formData.name);
    // Use custom expertise if "other" is selected, otherwise convert short form to full text
    const categoryValue = formData.expertise === "other"
      ? formData.customExpertise.trim()
      : (expertiseMapping[formData.expertise] || formData.expertise);
    formDataObj.append("category", categoryValue);
    formDataObj.append("bio", formData.bio);
    formDataObj.append("skills", JSON.stringify(formData.skills));
    // Note: other_skills can be added if needed in the future

    setLoading(true);
    try {
      const response = await createMentorProfile(formDataObj);

      if (response.error) {
        toastrError(response.error || "Failed to save profile");
        return;
      }

      console.log("Server Response:", response);
      toastrSuccess("Profile saved successfully!");

      setTimeout(() => {
        router.push("/dashboard/coach");
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      toastrError(error.message || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow container-professional py-8 md:py-10 lg:py-12 fade-in">
        {/* Header */}
        <div className="mb-10 md:mb-12">
          <button
            onClick={() => router.push("/dashboard/coach")}
            className="flex items-center text-gray-600 hover:text-[var(--primary)] mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Setup Your Coach Profile
          </h1>
          <p className="text-gray-600 text-lg">
            Create a compelling profile to attract more clients
          </p>
        </div>

        {/* Progress Steps */}
        <div className="card p-6 mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-semibold">
                ✓
              </div>
              <span className="font-semibold text-gray-900">Basic Info</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-semibold">
                2
              </div>
              <span className="font-semibold text-gray-900">Skills & Bio</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-semibold">
                3
              </div>
              <span className="font-semibold text-gray-500">Complete</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          {/* Basic Information */}
          <div className="card spacing-comfortable">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                <UserCircleIcon className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                <p className="text-sm text-gray-600">Let clients know who you are</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-professional"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  className="input-professional bg-gray-50 cursor-not-allowed"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  readOnly
                  className="input-professional bg-gray-50 cursor-not-allowed"
                  placeholder="Not provided"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Expertise <span className="text-red-500">*</span>
                </label>
                <select
                  name="expertise"
                  value={formData.expertise}
                  onChange={handleChange}
                  required
                  className="input-professional"
                >
                  <option value="">Select your expertise</option>
                  <option value="fitness">Fitness & Wellness</option>
                  <option value="career">Career Development</option>
                  <option value="life">Life Coaching</option>
                  <option value="business">Business & Entrepreneurship</option>
                  <option value="tech">Technology & Programming</option>
                  <option value="finance">Finance & Investment</option>
                  <option value="other">Other</option>
                </select>
                {formData.expertise === "other" && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specify Your Expertise <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customExpertise"
                      value={formData.customExpertise || ""}
                      onChange={handleChange}
                      required={formData.expertise === "other"}
                      className="input-professional"
                      placeholder="e.g., Music, Art, Language, etc."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your specific area of expertise
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio & Skills */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
                  <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Your Bio</h2>
                  <p className="text-sm text-gray-600">Tell your story</p>
                </div>
              </div>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                maxLength={300}
                rows={6}
                className="input-professional"
                placeholder="Share your experience, certifications, and what makes you unique as a coach..."
              />
              <p className="text-xs text-gray-500 mt-2">
                {formData.bio.length}/300 characters
              </p>
            </div>

            <div className="card p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                  <AcademicCapIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Skills & Expertise</h2>
                  <p className="text-sm text-gray-600">Add your key skills</p>
                </div>
              </div>
              <SkillInput skills={formData.skills} onSkillsChange={handleSkillsChange} />
            </div>
          </div>

          {/* Google Calendar Integration */}
          <div className="card spacing-comfortable">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mr-3">
                <CalendarIcon className="w-7 h-7 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Google Calendar Integration <span className="text-red-500 text-sm font-normal ml-2">(Required)</span>
                </h2>
                <p className="text-sm text-gray-600">Connect your calendar to automatically create events and send meeting links</p>
              </div>
            </div>

            {calendarStatus.loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '3px' }}></div>
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
                    Connect your Google Calendar to automatically:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-2">
                    <li>Create calendar events for booked sessions</li>
                    <li>Generate Google Meet links automatically</li>
                    <li>Block time in your calendar</li>
                    <li>Send calendar invites to learners</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={handleConnectCalendar}
                  className="btn btn-primary px-6 py-3 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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
              onClick={() => router.push("/dashboard/coach")}
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
};

export default ProfileForm;
