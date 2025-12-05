"use client";

import ChatBox from "@/components/useraiinteract/chatbox";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ Import router

export default function InteractPage() {
  const { data: session, status } = useSession();
  const [userId, setUserId] = useState(null);
  const router = useRouter(); // ✅ Initialize router

  // On mount, set userId from session or localStorage
  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
      localStorage.setItem("userId", session.user.id);
      console.log("✅ userId from session:", session.user.id);
    } else {
      const storedId = localStorage.getItem("userId");
      if (storedId) {
        setUserId(storedId);
        console.log("✅ userId from localStorage:", storedId);
      } else {
        console.log("❌ No userId found in session or localStorage");
      }
    }
  }, [session]);

  if (status === "loading")
    return <p className="text-center mt-8">Loading...</p>;

  if (!userId)
    return (
      <p className="text-center mt-8 text-red-500">
        Please log in to chat with AI.
      </p>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-extrabold text-indigo-700 text-center mb-6">
        Ask Questions & Get AI Feedback
      </h1>

      <div className="bg-white shadow-lg rounded-2xl p-4 border border-gray-200">
        <ChatBox userId={parseInt(userId)} />
      </div>

      {/* ✅ Back Button below the chat box */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
