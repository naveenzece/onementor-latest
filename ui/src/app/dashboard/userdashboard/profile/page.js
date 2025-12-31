"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SkillInput from "@/components/userprofile/SkillInput";
import InterestSelector from "@/components/userprofile/InterestSelector";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { toastrSuccess, toastrError } from "@/components/ui/toaster/toaster";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getUserProfile, createUserProfile, getUserFromDatabase, updateUserBasicInfo } from "@/services/user/user";

export default function ProfileSetup() {
  const router = useRouter();

  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);

  // User basic info
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");

  // Load user info from database instead of localStorage
  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (userId) {
      // Fetch all user data from database
      fetchUserDataFromDatabase(userId);
    } else {
      toastrError("User ID not found. Please login again.");
      router.push("/login");
    }
  }, []);

  // Fetch user data from database
  const fetchUserDataFromDatabase = async (userId) => {
    try {
      console.log("Fetching user data from database for userId:", userId);

      // Get user data from database
      const userResponse = await getUserFromDatabase(userId);
      console.log("getUserFromDatabase response:", userResponse);

      if (userResponse && !userResponse.error) {
        // Set user basic info from database
        if (userResponse.name) setUserName(userResponse.name);
        if (userResponse.email) setUserEmail(userResponse.email);
        if (userResponse.phone) setUserPhone(userResponse.phone);

        // Set skills and interests
        if (userResponse.skills) {
          const skillsData = typeof userResponse.skills === "string"
            ? JSON.parse(userResponse.skills)
            : userResponse.skills;
          setSkills(Array.isArray(skillsData) ? skillsData : []);
        }

        if (userResponse.interests) {
          const interestsData = typeof userResponse.interests === "string"
            ? JSON.parse(userResponse.interests)
            : userResponse.interests;
          setInterests(Array.isArray(interestsData) ? interestsData : []);
        }

        console.log("User data loaded from database:", {
          name: userResponse.name,
          email: userResponse.email,
          phone: userResponse.phone
        });
      } else {
        console.log("Could not fetch user data from database, using localStorage as fallback");
        // Fallback to localStorage if database doesn't have the data
        const name = localStorage.getItem("userName");
        const email = localStorage.getItem("userEmail");
        if (name) setUserName(name);
        if (email) setUserEmail(email);

        // Still try to get profile data for skills/interests
        fetchProfile(userId);
      }
    } catch (error) {
      console.error("Error fetching user data from database:", error);
      // Fallback to localStorage
      const name = localStorage.getItem("userName");
      const email = localStorage.getItem("userEmail");
      if (name) setUserName(name);
      if (email) setUserEmail(email);
      fetchProfile(userId);
    }
  };

  const fetchProfile = async (userId) => {
    try {
      console.log("Fetching profile for userId:", userId);
      const response = await getUserProfile(userId);
      console.log("getUserProfile response:", response);

      if (response?.skills) {
        const skillsData =
          typeof response.skills === "string"
            ? JSON.parse(response.skills)
            : response.skills;
        setSkills(Array.isArray(skillsData) ? skillsData : []);
      }
      if (response?.interests) {
        const interestsData =
          typeof response.interests === "string"
            ? JSON.parse(response.interests)
            : response.interests;
        setInterests(Array.isArray(interestsData) ? interestsData : []);
      }
      // Set user info from response if available
      if (response?.name) setUserName(response.name);
      if (response?.email) setUserEmail(response.email);
      if (response?.phone) {
        setUserPhone(response.phone);
        console.log("Phone number from profile:", response.phone);
      }
      if (response?.phoneNumber) {
        setUserPhone(response.phoneNumber);
        console.log("Phone number from profile (phoneNumber field):", response.phoneNumber);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!skills.length || !interests.length) {
      toastrError("Please fill skills and interests fields.");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      toastrError("User ID not found. Please login again.");
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      // First update user basic info (name, email, phone) in users table
      const userUpdateData = {
        name: userName,
        email: userEmail,
        phone: userPhone
      };

      console.log("Updating user basic info:", userUpdateData);
      const userUpdateResponse = await updateUserBasicInfo(userId, userUpdateData);

      if (userUpdateResponse.error) {
        console.log("User basic info update failed, continuing with profile update");
      } else {
        console.log("User basic info updated successfully");
      }

      // Then update profile data (skills, interests)
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("skills", JSON.stringify(skills));
      formData.append("interests", JSON.stringify(interests));
      formData.append("name", userName);
      formData.append("email", userEmail);
      formData.append("phone", userPhone);

      console.log("Updating profile data");
      const profileResponse = await createUserProfile(formData);

      if (profileResponse.error) {
        toastrError(profileResponse.error || "Error saving profile");
      } else {
        toastrSuccess(profileResponse.message || "Profile saved successfully!");

        // Update localStorage with new data
        localStorage.setItem("userName", userName);
        localStorage.setItem("userEmail", userEmail);

        setTimeout(() => {
          router.push("/dashboard/user");
        }, 1500);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      toastrError("Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow container-professional py-10">
        {/* Back */}
        <button
          onClick={() => router.push("/dashboard/user")}
          className="flex items-center text-gray-600 hover:text-[var(--primary)] mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        {/* Welcome */}
        <h1 className="text-4xl font-bold gradient-text mb-3">
          Welcome back, {userName}...
        </h1>
        <p className="text-gray-600 mb-8">
          Complete your profile to get better mentor recommendations
        </p>

        {/* 🔹 PROFILE INFO BOX */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Profile Information
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                value={userEmail}
                disabled
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Skills */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-2">Your Skills</h2>
              <SkillInput skills={skills} setSkills={setSkills} />
            </div>

            {/* Interests */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-2">Your Interests</h2>
              <InterestSelector
                interests={interests}
                setInterests={setInterests}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mb-8">
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
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
