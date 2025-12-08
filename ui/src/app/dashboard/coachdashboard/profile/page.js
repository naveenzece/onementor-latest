"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SkillInput from "@/components/coach/profile/SkillsInput";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { toastrSuccess, toastrError } from "@/components/ui/toaster/toaster";
import { ArrowLeftIcon, UserCircleIcon, AcademicCapIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { createMentorProfile, getMentorProfile } from "@/services/mentor/mentor";

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
    expertise: "",
    customExpertise: "",
    bio: "",
    skills: [],
    slots: [],
  });

  useEffect(() => {
    // Fetch existing profile if any
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchProfile(userId);
    }
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const response = await getMentorProfile(userId);
      
      if (response.error) {
        // Profile doesn't exist yet, which is fine
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
        name: data.username || "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("userId");
    if (!userId) {
      toastrError("User not found. Please login again.");
      router.push("/login");
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
};

export default ProfileForm;
