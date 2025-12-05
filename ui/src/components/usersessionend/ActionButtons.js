"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toastrSuccess, toastrInfo } from "@/components/ui/toaster/toaster";

const ActionButtons = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:8001/api/auth/logout", {
        method: "POST",
        credentials: 'include',
      });
      
      if (res.ok) {
        localStorage.clear();
        toastrSuccess("Logged out successfully!");
        setTimeout(() => {
          router.push("/login");
        }, 1000);
      }
    } catch (err) {
      console.error("Logout error:", err);
      localStorage.clear();
      router.push("/login");
    }
  };

  const handleBookAgain = () => {
    toastrInfo("Redirecting to booking page...");
    router.push("/dashboard/userdashboard/coachdiscovery");
  };

  return (
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
  );
};

export default ActionButtons;
