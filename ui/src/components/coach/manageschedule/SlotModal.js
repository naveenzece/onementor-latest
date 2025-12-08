"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { X, Clock, Calendar, Save, Plus } from "lucide-react";
import { toastrError } from "@/components/ui/toaster/toaster";

const SlotModal = ({ isOpen, onClose, selectedDate, selectedSlot, onSave, isEditing = false }) => {
  const [formData, setFormData] = useState({
    date: selectedDate || new Date(),
    startDateTime: null,
    endDateTime: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when modal opens or selectedDate/slot changes
  useEffect(() => {
    if (isOpen) {
      if (isEditing && selectedSlot) {
        // Editing mode - populate with existing slot data
        try {
          // Parse date safely
          let slotDate;
          if (selectedSlot.date) {
            // Try different date formats
            if (typeof selectedSlot.date === 'string') {
              // If it's already in ISO format or has time
              if (selectedSlot.date.includes('T')) {
                slotDate = new Date(selectedSlot.date);
              } else {
                // Format: yyyy-MM-dd
                slotDate = new Date(selectedSlot.date + 'T00:00:00');
              }
            } else {
              slotDate = new Date(selectedSlot.date);
            }
            
            // Validate date
            if (isNaN(slotDate.getTime())) {
              console.error("Invalid date from slot:", selectedSlot.date);
              slotDate = new Date(); // Fallback to today
            }
          } else {
            slotDate = new Date(); // Fallback to today
          }

          // Parse times safely
          let startHour = 9, startMin = 0;
          let endHour = 10, endMin = 0;

          if (selectedSlot.start_time) {
            try {
              const startParts = selectedSlot.start_time.split(':').map(Number);
              startHour = startParts[0] || 9;
              startMin = startParts[1] || 0;
            } catch (e) {
              console.error("Error parsing start_time:", e);
            }
          }

          if (selectedSlot.end_time) {
            try {
              const endParts = selectedSlot.end_time.split(':').map(Number);
              endHour = endParts[0] || 10;
              endMin = endParts[1] || 0;
            } catch (e) {
              console.error("Error parsing end_time:", e);
            }
          }

          const startDateTime = new Date(slotDate);
          startDateTime.setHours(startHour, startMin, 0, 0);

          const endDateTime = new Date(slotDate);
          endDateTime.setHours(endHour, endMin, 0, 0);

          // Validate times
          if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
            console.error("Invalid datetime created from slot data");
            // Use fallback
            const today = new Date();
            const defaultStart = new Date(today);
            defaultStart.setHours(9, 0, 0);
            const defaultEnd = new Date(today);
            defaultEnd.setHours(10, 0, 0);
            
            setFormData({
              date: today,
              startDateTime: defaultStart,
              endDateTime: defaultEnd,
            });
          } else {
            setFormData({
              date: slotDate,
              startDateTime,
              endDateTime,
            });
          }
        } catch (error) {
          console.error("Error initializing form data for editing:", error);
          // Fallback to today with default times
          const today = new Date();
          const defaultStart = new Date(today);
          defaultStart.setHours(9, 0, 0);
          const defaultEnd = new Date(today);
          defaultEnd.setHours(10, 0, 0);
          
          setFormData({
            date: today,
            startDateTime: defaultStart,
            endDateTime: defaultEnd,
          });
        }
      } else {
        // Adding mode - use selected date or today
        const date = selectedDate || new Date();
        // Validate date
        const validDate = isNaN(date.getTime()) ? new Date() : date;
        
        const defaultStart = new Date(validDate);
        defaultStart.setHours(9, 0, 0);

        const defaultEnd = new Date(validDate);
        defaultEnd.setHours(10, 0, 0);

        setFormData({
          date: validDate,
          startDateTime: defaultStart,
          endDateTime: defaultEnd,
        });
      }
    }
  }, [isOpen, selectedDate, selectedSlot, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.startDateTime || !formData.endDateTime) {
      toastrError("Please fill in all fields");
      return;
    }

    if (formData.endDateTime <= formData.startDateTime) {
      toastrError("End time must be after start time");
      return;
    }

    setIsSubmitting(true);

    try {
      // Format date as YYYY-MM-DD using local timezone (not UTC)
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const formattedDate = formatDate(formData.date);
      
      const formatTime = (date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      };

      const slotData = {
        date: formattedDate,
        start_time: formatTime(formData.startDateTime),
        end_time: formatTime(formData.endDateTime),
      };

      if (isEditing && selectedSlot) {
        slotData.id = selectedSlot.id;
      }

      await onSave(slotData);
      
      // Reset and close
      setFormData({
        date: selectedDate || new Date(),
        startDateTime: null,
        endDateTime: null,
      });
      onClose();
    } catch (error) {
      console.error("Error saving slot:", error);
      toastrError(error.message || "Failed to save slot");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => {
      const newDate = date || prev.date;
      
      // Validate date
      if (!newDate || isNaN(newDate.getTime())) {
        console.error("Invalid date selected");
        return prev; // Don't update if date is invalid
      }
      
      // Update times to match new date
      const newStart = new Date(newDate);
      if (prev.startDateTime && !isNaN(prev.startDateTime.getTime())) {
        newStart.setHours(prev.startDateTime.getHours(), prev.startDateTime.getMinutes(), 0, 0);
      } else {
        newStart.setHours(9, 0, 0);
      }

      const newEnd = new Date(newDate);
      if (prev.endDateTime && !isNaN(prev.endDateTime.getTime())) {
        newEnd.setHours(prev.endDateTime.getHours(), prev.endDateTime.getMinutes(), 0, 0);
      } else {
        newEnd.setHours(10, 0, 0);
      }

      return {
        date: newDate,
        startDateTime: newStart,
        endDateTime: newEnd,
      };
    });
  };

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-lg w-full bg-white rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800">
              {isEditing ? "Edit Slot" : "Add New Slot"}
            </DialogTitle>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Date Picker */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                Select Date
              </label>
              <DatePicker
                selected={formData.date && !isNaN(formData.date.getTime()) ? formData.date : null}
                onChange={handleDateChange}
                minDate={minDate}
                dateFormat="MMMM dd, yyyy"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                placeholderText="Select a date"
                disabled={isEditing} // Disable date change when editing
              />
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-4 h-4" />
                  Start Time
                </label>
                <DatePicker
                  selected={formData.startDateTime}
                  onChange={(date) => {
                    if (date) {
                      const newDateTime = new Date(formData.date);
                      newDateTime.setHours(date.getHours(), date.getMinutes(), 0, 0);
                      setFormData(prev => ({
                        ...prev,
                        startDateTime: newDateTime,
                        // Auto-adjust end time if needed
                        endDateTime: prev.endDateTime && newDateTime >= prev.endDateTime
                          ? new Date(newDateTime.getTime() + 60 * 60 * 1000) // Add 1 hour
                          : prev.endDateTime,
                      }));
                    }
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  placeholderText="Select start time"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-800 font-medium"
                  wrapperClassName="w-full"
                  minTime={new Date(new Date(formData.date).setHours(8, 0, 0))}
                  maxTime={new Date(new Date(formData.date).setHours(22, 0, 0))}
                  required
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-4 h-4" />
                  End Time
                </label>
                <DatePicker
                  selected={formData.endDateTime}
                  onChange={(date) => {
                    if (date) {
                      const newDateTime = new Date(formData.date);
                      newDateTime.setHours(date.getHours(), date.getMinutes(), 0, 0);
                      setFormData(prev => ({
                        ...prev,
                        endDateTime: newDateTime,
                      }));
                    }
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  placeholderText="Select end time"
                  minTime={formData.startDateTime ? new Date(new Date(formData.date).setHours(formData.startDateTime.getHours(), formData.startDateTime.getMinutes() + 15, 0)) : undefined}
                  maxTime={new Date(new Date(formData.date).setHours(23, 59, 0))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-800 font-medium"
                  wrapperClassName="w-full"
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.date || !formData.startDateTime || !formData.endDateTime}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isEditing ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>
                    {isEditing ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {isEditing ? "Update Slot" : "Add Slot"}
                  </>
                )}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default SlotModal;

