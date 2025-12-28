"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ Import router
import CoachCard from "@/components/userbooksession/coachcard";
import SlotSelector from "@/components/userbooksession/SlotSelector";
import Confirmation from "@/components/userbooksession/confirmation";

import { discoverMentors } from "@/services/discovery/discovery";
import { getSlotsByMentor } from "@/services/mentor/mentor";
import { bookSlot } from "@/services/booking/booking";

export default function BookSession() {
  const [step, setStep] = useState(1);
  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  const router = useRouter(); // ✅ Initialize router

  // Load user info from localStorage
  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    const storedRole = localStorage.getItem("userRole");
    const storedEmail = localStorage.getItem("userEmail");

    if (storedId) {
      setUserId(storedId);
      setUserRole(storedRole);
      setUserEmail(storedEmail);
    } else {
      setError("User not logged in. Please log in first.");
    }
  }, []);

  // Fetch all coaches
  useEffect(() => {
    setLoading(true);
    discoverMentors()
      .then((data) => {
        if (data.error) throw new Error(data.error);
        if (Array.isArray(data)) setCoaches(data);
        else if (data && Array.isArray(data.rows)) setCoaches(data.rows);
        else setCoaches([]);
      })
      .catch(() => setError("Failed to load coaches."))
      .finally(() => setLoading(false));
  }, []);

  // Fetch slots for selected coach
  useEffect(() => {
    if (selectedCoach) {
      setLoading(true);
      getSlotsByMentor(selectedCoach.id)
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setSlots(data);
        })
        .catch(() => setError("Failed to load slots."))
        .finally(() => setLoading(false));
    }
  }, [selectedCoach]);

  // Confirm booking
  const handleConfirm = () => {
    if (!selectedCoach || !selectedSlot) return;
    if (!userId) return setError("Login required to book session.");

    setLoading(true);
    bookSlot({
      coachId: selectedCoach.id,
      slotId: selectedSlot.id,
      userId,
    })
      .then((data) => {
        if (data.error) setError(data.error);
        else setSuccess(true);
      })
      .catch(() => setError("Booking failed."))
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8 min-h-screen bg-gray-50">
      <h1 className="text-4xl md:text-5xl font-bold text-center text-indigo-700 mb-6">
        Book a Session
      </h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow-sm border border-red-200">
          {error}
        </div>
      )}

      {loading && (
        <p className="text-gray-500 text-center text-lg animate-pulse">
          Loading...
        </p>
      )}

      {success && selectedCoach && selectedSlot && (
        <div className="bg-green-50 p-8 rounded-lg text-center shadow-md border border-green-200">
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            🎉 Booking Confirmed!
          </h2>
          <p className="text-lg text-gray-700 mb-1">
            With <span className="font-semibold">{selectedCoach.name}</span>
          </p>
          <p className="text-gray-600 mb-4">{selectedCoach.expertise}</p>
          <p className="text-indigo-700 font-medium text-lg mb-4">
            {new Date(selectedSlot.time).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          <button
            onClick={() => {
              setStep(1);
              setSelectedCoach(null);
              setSelectedSlot(null);
              setSuccess(false);
            }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Book Another Session
          </button>
        </div>
      )}

      {/* Step 1: Select Coach */}
      {step === 1 && !loading && !success && (
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-indigo-600">
            Select a Coach
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {coaches.map((coach) => (
              <CoachCard
                key={coach.id}
                coach={coach}
                onSelect={() => {
                  setSelectedCoach(coach);
                  setStep(2);
                }}
                className="p-4 bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition-transform transform hover:scale-105"
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Slot */}
      {step === 2 && selectedCoach && !loading && !success && (
        <SlotSelector
          coach={selectedCoach}
          slots={slots}
          onBack={() => setStep(1)}
          onSelect={(slot) => {
            setSelectedSlot(slot);
            setStep(3);
          }}
          className="p-4 bg-white rounded-lg shadow"
        />
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && selectedCoach && selectedSlot && !loading && !success && (
        <Confirmation
          coach={selectedCoach}
          slot={{
            ...selectedSlot,
            time: new Date(selectedSlot.time).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            }),
          }}
          onBack={() => setStep(2)}
          onConfirm={handleConfirm}
          className="p-4 bg-white rounded-lg shadow"
        />
      )}

      {/* ✅ Global Back Button below everything */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
