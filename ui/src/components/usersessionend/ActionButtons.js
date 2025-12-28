"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toastrSuccess, toastrInfo } from "@/components/ui/toaster/toaster";
import Loader from "@/components/ui/loader/loader";

import { logout } from "@/services/auth/auth";

const ActionButtons = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();

      localStorage.clear();
      toastrSuccess("Logged out successfully!");
      // Redirect to login - keep loader visible during redirect
      setTimeout(() => {
        router.push("/login");
      }, 1000);
      // Don't set loading to false - keep it visible during redirect
    } catch (err) {
      console.error("Logout error:", err);
      localStorage.clear();
      // Redirect to login - keep loader visible during redirect
      router.push("/login");
      // Don't set loading to false - keep it visible during redirect
    }
  };

  const handleBookAgain = () => {
    toastrInfo("Redirecting to booking page...");
    router.push("/dashboard/userdashboard/coachdiscovery");
  };

  return (
    <>
      <Loader isLoading={loading} message="Logging out..." />
      <div className="flex flex-col md:flex-row justify-center gap-4">
        <button
          onClick={handleBookAgain}
          className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
        >
          Book Another Session
        </button>

        <button
          onClick={handleLogout}
          className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
        >
          Logout
        </button>
      </div>
    </>
  );
};

export default ActionButtons;
