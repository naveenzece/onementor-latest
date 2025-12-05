"use client";

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, Clock, Plus } from "lucide-react";

const SlotForm = ({ onAddSlot }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startDateTime, setStartDateTime] = useState(null);
  const [endDateTime, setEndDateTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate || !startDateTime || !endDateTime) {
      return;
    }

    // Validate time - end time must be after start time
    if (endDateTime <= startDateTime) {
      alert("End time must be after start time");
      return;
    }

    setIsSubmitting(true);

    // Format date as YYYY-MM-DD
    const formattedDate = selectedDate.toISOString().split('T')[0];
    
    // Format time as HH:mm
    const formatTime = (date) => {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };
    
    const startTime = formatTime(startDateTime);
    const endTime = formatTime(endDateTime);
    
    try {
      await onAddSlot({ 
        date: formattedDate, 
        start_time: startTime, 
        end_time: endTime 
      });
      
      // Reset form
      setStartDateTime(null);
      setEndDateTime(null);
      // Keep the date selected for adding more slots on the same day
    } catch (error) {
      console.error("Error adding slot:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set minimum date to today
  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  // Initialize start and end times when date changes
  useEffect(() => {
    if (selectedDate) {
      // Update times when date changes, preserving the time if already set
      setStartDateTime(prev => {
        if (prev) {
          const newStart = new Date(selectedDate);
          newStart.setHours(prev.getHours(), prev.getMinutes(), 0, 0);
          return newStart;
        } else {
          const defaultStart = new Date(selectedDate);
          defaultStart.setHours(9, 0, 0); // 9:00 AM default
          return defaultStart;
        }
      });
      
      setEndDateTime(prev => {
        if (prev) {
          const newEnd = new Date(selectedDate);
          newEnd.setHours(prev.getHours(), prev.getMinutes(), 0, 0);
          return newEnd;
        } else {
          const defaultEnd = new Date(selectedDate);
          defaultEnd.setHours(10, 0, 0); // 10:00 AM default
          return defaultEnd;
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Plus className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Add New Slot</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Date Picker */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Calendar className="w-4 h-4" />
            Select Date
          </label>
          <div className="relative">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              minDate={minDate}
              dateFormat="MMMM dd, yyyy"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              placeholderText="Select a date"
              filterDate={(date) => {
                // Disable past dates
                return date >= minDate;
              }}
            />
          </div>
        </div>

        {/* Time Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Clock className="w-4 h-4" />
              Start Time
            </label>
            <DatePicker
              selected={startDateTime}
              onChange={(date) => {
                if (date) {
                  // Combine selected date with selected time
                  const newDateTime = new Date(selectedDate);
                  newDateTime.setHours(date.getHours(), date.getMinutes(), 0, 0);
                  setStartDateTime(newDateTime);
                  
                  // Auto-adjust end time if it's before or equal to start time
                  if (endDateTime && newDateTime >= endDateTime) {
                    const newEndTime = new Date(newDateTime);
                    newEndTime.setHours(newDateTime.getHours() + 1); // Add 1 hour by default
                    // Make sure end time doesn't exceed 11:59 PM
                    if (newEndTime.getHours() >= 24) {
                      newEndTime.setHours(23, 59, 0);
                    }
                    setEndDateTime(newEndTime);
                  }
                } else {
                  setStartDateTime(null);
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
              minTime={new Date(new Date(selectedDate).setHours(8, 0, 0))}
              maxTime={new Date(new Date(selectedDate).setHours(22, 0, 0))}
              required
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Clock className="w-4 h-4" />
              End Time
            </label>
            <DatePicker
              selected={endDateTime}
              onChange={(date) => {
                if (date) {
                  // Combine selected date with selected time
                  const newDateTime = new Date(selectedDate);
                  newDateTime.setHours(date.getHours(), date.getMinutes(), 0, 0);
                  setEndDateTime(newDateTime);
                } else {
                  setEndDateTime(null);
                }
              }}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="h:mm aa"
              placeholderText="Select end time"
              minTime={startDateTime ? new Date(new Date(selectedDate).setHours(startDateTime.getHours(), startDateTime.getMinutes() + 15, 0)) : new Date(new Date(selectedDate).setHours(8, 0, 0))}
              maxTime={new Date(new Date(selectedDate).setHours(23, 59, 0))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-800 font-medium"
              wrapperClassName="w-full"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !selectedDate || !startDateTime || !endDateTime}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Adding...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Add Slot
            </>
          )}
        </button>
      </form>

      {/* Helper Text */}
      <p className="mt-4 text-xs text-gray-500 text-center">
        Select a date and time range for your availability
      </p>
    </div>
  );
};

export default SlotForm;
