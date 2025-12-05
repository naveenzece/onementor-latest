"use client";

import React, { useMemo } from "react";
import { format, parse } from "date-fns";
import { Calendar, Clock, Trash2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const SlotList = ({ slots = [], onDelete }) => {
  const safeSlots = Array.isArray(slots) ? slots : [];

  // Group slots by date and sort
  const groupedSlots = useMemo(() => {
    const grouped = {};
    safeSlots
      .filter(slot => slot.is_active !== 0)
      .sort((a, b) => {
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        return a.start_time.localeCompare(b.start_time);
      })
      .forEach((slot) => {
        if (!grouped[slot.date]) {
          grouped[slot.date] = [];
        }
        grouped[slot.date].push(slot);
      });
    return grouped;
  }, [safeSlots]);

  const handleDelete = async (slotId) => {
    if (window.confirm("Are you sure you want to delete this slot?")) {
      await onDelete(slotId);
    }
  };

  if (safeSlots.length === 0 || Object.keys(groupedSlots).length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No slots added yet.</p>
          <p className="text-gray-400 text-sm mt-1">Add your first slot above</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Calendar className="w-5 h-5 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Your Slots</h2>
        <span className="ml-auto text-sm text-gray-500 font-medium">
          {safeSlots.filter(s => s.is_active !== 0).length} total
        </span>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {Object.entries(groupedSlots).map(([date, dateSlots]) => {
          // Parse the date string (format: yyyy-MM-dd) into a Date object
          let parsedDate;
          try {
            parsedDate = parse(date, "yyyy-MM-dd", new Date());
            // Check if the parsed date is valid
            if (isNaN(parsedDate.getTime())) {
              // Fallback: try parsing as ISO string
              parsedDate = new Date(date);
            }
          } catch (error) {
            // Fallback: try creating date directly
            parsedDate = new Date(date);
          }
          
          // Format the date safely
          let formattedDateString = date; // Fallback to original date string
          try {
            if (parsedDate && !isNaN(parsedDate.getTime())) {
              formattedDateString = format(parsedDate, "EEEE, MMMM dd, yyyy");
            }
          } catch (error) {
            console.error("Error formatting date:", error);
          }
          
          return (
            <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Date Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-semibold">
                    {formattedDateString}
                  </span>
                  <span className="ml-auto text-sm opacity-90">
                    {dateSlots.length} slot{dateSlots.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Slots for this date */}
              <div className="divide-y divide-gray-100">
                {dateSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                        slot.is_booked 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {slot.is_booked ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="font-semibold">
                              {slot.start_time} - {slot.end_time}
                            </span>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            slot.is_booked
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {slot.is_booked ? 'Booked' : 'Available'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!slot.is_booked && (
                      <button
                        onClick={() => handleDelete(slot.id)}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                        title="Delete slot"
                      >
                        <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </button>
                    )}
                    
                    {slot.is_booked && (
                      <div className="ml-4 flex items-center gap-1 text-xs text-gray-500">
                        <AlertCircle className="w-4 h-4" />
                        <span>Cannot delete</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SlotList;

