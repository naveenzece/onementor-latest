"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toastrSuccess, toastrError } from "@/components/ui/toaster/toaster";
import CalendarSlots from "@/components/coach/manageschedule/CalendarSlots";
import SlotModal from "@/components/coach/manageschedule/SlotModal";
import ViewSlotModal from "@/components/coach/manageschedule/ViewSlotModal";
import Header from "@/components/Header/header";
import { Calendar, ArrowLeft, Users, Clock } from "lucide-react";

const SchedulePage = () => {
  const router = useRouter();
  const [slots, setSlots] = useState([]);
  const [coachId, setCoachId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load user info from localStorage
  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    const storedRole = localStorage.getItem("userRole");
    const storedEmail = localStorage.getItem("userEmail");

    if (storedId) {
      setCoachId(storedId);
      setUserRole(storedRole);
      setUserEmail(storedEmail);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch slots for this mentor
  const fetchSlots = async () => {
    if (!coachId) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(
        `http://localhost:8001/api/mentor/slots/mentor/${coachId}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to fetch slots");
      const data = await res.json();
      setSlots(data || []);
    } catch (err) {
      console.error("Error fetching slots:", err);
      toastrError("Failed to load slots. Please refresh the page.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (coachId) {
      fetchSlots();
    }
  }, [coachId]);

  // Handle date selection from calendar (add new slot)
  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setIsEditing(false);
    setIsEditModalOpen(true);
  };

  // Handle slot selection from calendar (show view modal first)
  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setIsViewModalOpen(true);
  };

  // Handle edit from view modal
  const handleEditFromView = (slot) => {
    setSelectedSlot(slot);
    setSelectedDate(new Date(slot.date + 'T00:00:00'));
    setIsEditing(true);
    setIsViewModalOpen(false);
    setIsEditModalOpen(true);
  };

  // Handle save slot (add or update)
  const handleSaveSlot = async (slotData) => {
    if (!coachId) return;
    
    try {
      if (isEditing && slotData.id) {
        // Update existing slot
        const res = await fetch(`http://localhost:8001/api/mentor/slots/${slotData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            date: slotData.date,
            start_time: slotData.start_time,
            end_time: slotData.end_time,
          }),
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to update slot");
        }

        await fetchSlots();
        toastrSuccess("Slot updated successfully! 🎉");
      } else {
        // Create new slot
        const res = await fetch("http://localhost:8001/api/mentor/slots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...slotData,
            mentor_id: coachId,
          }),
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to create slot");
        }

        await fetchSlots();
        toastrSuccess("Slot created successfully! 🎉");
      }
    } catch (err) {
      console.error("Error saving slot:", err);
      toastrError(err.message || `Failed to ${isEditing ? 'update' : 'create'} slot`);
      throw err;
    }
  };

  // Close view modal
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedSlot(null);
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedDate(null);
    setSelectedSlot(null);
    setIsEditing(false);
  };

  // Delete slot
  const handleDeleteSlot = async (id) => {
    try {
      const res = await fetch(`http://localhost:8001/api/mentor/slots/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete slot");
      }

      // Refresh slots instead of filtering to get fresh data
      await fetchSlots();
      toastrSuccess("Slot deleted successfully!");
    } catch (err) {
      console.error("Error deleting slot:", err);
      toastrError(err.message || "Failed to delete slot");
    }
  };

  // Back button handler
  const handleBack = () => {
    router.back();
  };

  // Statistics
  const stats = {
    total: slots.filter(s => s.is_active !== 0).length,
    available: slots.filter(s => s.is_active !== 0 && !s.is_booked).length,
    booked: slots.filter(s => s.is_active !== 0 && s.is_booked).length,
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your schedule...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!coachId) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-500">
            <p className="text-lg font-semibold">User ID not found</p>
            <p className="text-sm mt-2">Please log in first</p>
            <button
              onClick={() => router.push("/login")}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />

      <main className="flex-grow w-full container-professional py-12 md:py-16 lg:py-20 fade-in">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                Manage Your Availability
              </h1>
              <p className="text-gray-600">
                Welcome back, <span className="font-semibold text-gray-800">{userEmail}</span>
              </p>
            </div>

          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Slots</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Available</p>
                  <p className="text-3xl font-bold text-green-600">{stats.available}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Booked</p>
                  <p className="text-3xl font-bold text-red-600">{stats.booked}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <Users className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Calendar Only */}
        <div className="w-full">
          <CalendarSlots 
            slots={slots} 
            onSelectSlot={handleSelectSlot}
            onSelectDate={handleSelectDate}
          />
        </div>

        {/* View Slot Modal */}
        <ViewSlotModal
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
          slot={selectedSlot}
          onEdit={handleEditFromView}
          onDelete={handleDeleteSlot}
        />

        {/* Edit/Add Slot Modal */}
        <SlotModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          onSave={handleSaveSlot}
          isEditing={isEditing}
        />
      </main>
    </div>
  );
};

export default SchedulePage;
