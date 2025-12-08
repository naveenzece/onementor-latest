"use client";

import React from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X, Calendar, Clock, Edit2, Trash2, CheckCircle, XCircle, User } from "lucide-react";
import { format, parse } from "date-fns";

const ViewSlotModal = ({ isOpen, onClose, slot, onEdit, onDelete }) => {
  if (!slot) return null;

  // Parse and format date
  let formattedDate = slot.date;
  try {
    const slotDate = parse(slot.date, "yyyy-MM-dd", new Date());
    if (!isNaN(slotDate.getTime())) {
      formattedDate = format(slotDate, "EEEE, MMMM dd, yyyy");
    }
  } catch (error) {
    console.error("Error formatting date:", error);
  }

  const handleEdit = () => {
    onClose();
    if (onEdit) {
      onEdit(slot);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete this slot?\n\nDate: ${formattedDate}\nTime: ${slot.start_time} - ${slot.end_time}`)) {
      if (onDelete) {
        await onDelete(slot.id);
      }
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-white">
                Slot Details
              </DialogTitle>
              <button
                onClick={onClose}
                className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-center">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
                  slot.is_booked
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {slot.is_booked ? (
                  <>
                    <XCircle className="w-5 h-5" />
                    <span>Booked</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Available</span>
                  </>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              {/* Date */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="text-lg font-semibold text-gray-800">{formattedDate}</p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Clock className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Time</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {slot.start_time || "N/A"} - {slot.end_time || "N/A"}
                  </p>
                </div>
              </div>

              {/* Slot ID (for reference) */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Slot ID</p>
                  <p className="text-sm font-mono text-gray-700">#{slot.id}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              {!slot.is_booked && (
                <>
                  <button
                    onClick={handleEdit}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    <Edit2 className="w-5 h-5" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete
                  </button>
                </>
              )}
              {slot.is_booked && (
                <div className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-sm text-yellow-800 text-center font-medium">
                    ⚠️ This slot is booked and cannot be edited or deleted
                  </p>
                </div>
              )}
            </div>

            {/* Info Message */}
            {!slot.is_booked && (
              <p className="text-xs text-gray-500 text-center">
                Only available slots can be edited or deleted
              </p>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ViewSlotModal;

