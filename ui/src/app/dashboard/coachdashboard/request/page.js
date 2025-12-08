"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toastrSuccess, toastrError } from "@/components/ui/toaster/toaster";
import RequestCard from "@/components/coach/request/RequestCard";

const RequestsPage = () => {
  const router = useRouter(); // ✅ initialize router
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coachId, setCoachId] = useState(null);

  // Load coachId from localStorage
  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    if (storedId) {
      setCoachId(storedId);
    }
  }, []);

  // Fetch requests for this coach
  useEffect(() => {
    if (!coachId) return;

    const fetchRequests = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8001/api/requests/${coachId}`);
        if (!res.ok) throw new Error("Failed to fetch requests");
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError("Failed to load requests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [coachId]);

  // Update request status (approve/reject)
  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`http://localhost:8001/api/bookings/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      // Update local state optimistically
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: action } : req))
      );
      toastrSuccess(`Request ${action} successfully!`);
    } catch (err) {
      console.error("Error updating status:", err);
      toastrError("Failed to update request status. Please try again.");
    }
  };

  // Back button handler
  const handleBack = () => {
    router.back();
  };

  // Loading, error, empty states
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 p-6 flex justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full">
        {/* ✅ Back button */}
        <button
          onClick={handleBack}
          className="mb-6 px-4 py-2 bg-gray-400 text-white rounded-lg shadow hover:bg-gray-500 transition"
        >
          &larr; Back
        </button>

        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Incoming Session Requests
        </h1>

        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((req) => (
              <RequestCard key={req.id} request={req} onAction={handleAction} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">No new requests.</p>
        )}
      </div>
    </div>
  );
};

export default RequestsPage;
