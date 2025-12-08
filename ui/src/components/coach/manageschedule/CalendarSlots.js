"use client";

import React, { useMemo, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { format, parse, setHours, setMinutes } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Calendar as CalendarIcon, CheckCircle, XCircle } from "lucide-react";

// Create a localizer using moment
const localizer = momentLocalizer(moment);

const CalendarSlots = ({ slots = [], onSelectSlot, onSelectDate }) => {
  const safeSlots = Array.isArray(slots) ? slots : [];
  const [view, setView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Convert slots to calendar events format
  const events = useMemo(() => {
    try {
      return safeSlots
        .filter(slot => {
          // Filter out inactive slots (is_active === 0)
          // Include slots where is_active is 1, true, null, or undefined (treat as active)
          return slot.is_active !== 0 && slot.is_active !== '0';
        })
        .map((slot) => {
          try {
            // Parse date - handle different date formats
            let slotDate;
            if (typeof slot.date === 'string') {
              // Try parsing as yyyy-MM-dd format
              slotDate = parse(slot.date, "yyyy-MM-dd", new Date());
              // If parsing failed, try creating date directly
              if (isNaN(slotDate.getTime())) {
                slotDate = new Date(slot.date);
              }
            } else {
              slotDate = new Date(slot.date);
            }

            // Validate date
            if (isNaN(slotDate.getTime())) {
              console.error("Invalid date for slot:", slot);
              return null;
            }

            // Parse time - handle HH:mm format
            const timeParts = slot.start_time ? slot.start_time.split(":") : ["9", "0"];
            const [startHour, startMin] = timeParts.map(Number);
            
            const endTimeParts = slot.end_time ? slot.end_time.split(":") : ["10", "0"];
            const [endHour, endMin] = endTimeParts.map(Number);

            // Create start and end datetime objects
            const start = new Date(slotDate);
            start.setHours(startHour, startMin || 0, 0, 0);

            const end = new Date(slotDate);
            end.setHours(endHour, endMin || 0, 0, 0);

            // Validate times
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
              console.error("Invalid time for slot:", slot);
              return null;
            }

            return {
              id: slot.id,
              title: slot.is_booked 
                ? `Booked (${slot.start_time || ''} - ${slot.end_time || ''})` 
                : `${slot.start_time || ''} - ${slot.end_time || ''}`,
              start,
              end,
              resource: slot,
            };
          } catch (error) {
            console.error("Error parsing slot:", slot, error);
            return null;
          }
        })
        .filter(event => event !== null); // Remove null events
    } catch (error) {
      console.error("Error converting slots to events:", error);
      return [];
    }
  }, [safeSlots]);

  // Handle slot click (for editing)
  const handleSelectEvent = (event) => {
    if (onSelectSlot && event.resource) {
      onSelectSlot(event.resource);
    }
  };

  // Handle date slot click (for adding new slot)
  const handleSelectSlot = (slotInfo) => {
    if (onSelectDate) {
      onSelectDate(slotInfo.start);
    }
  };

  // Custom event style
  const eventStyleGetter = (event) => {
    const isBooked = event.resource.is_booked;
    
    return {
      style: {
        backgroundColor: isBooked ? "#ef4444" : "#10b981",
        borderColor: isBooked ? "#dc2626" : "#059669",
        borderRadius: "8px",
        opacity: 0.9,
        color: "white",
        border: "none",
        padding: "4px 8px",
        fontSize: "12px",
        fontWeight: "600",
        display: "flex",
        alignItems: "center",
        gap: "4px",
      },
    };
  };

  // Custom tooltip
  const customEvent = ({ event }) => {
    const slot = event.resource;
    return (
      <div className="flex items-center gap-2">
        {slot.is_booked ? (
          <XCircle className="w-3 h-3" />
        ) : (
          <CheckCircle className="w-3 h-3" />
        )}
        <span className="truncate">{event.title}</span>
      </div>
    );
  };

  // Show calendar even if no slots - user can still click to add
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Calendar View</h2>
          {events.length > 0 && (
            <span className="ml-2 text-sm text-gray-500">
              ({events.length} slot{events.length !== 1 ? 's' : ''})
            </span>
          )}
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-gray-600">Booked</span>
          </div>
        </div>
      </div>

      {safeSlots.length === 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 Click on any date in the calendar to add your availability slots
          </p>
        </div>
      )}

      <div className="h-[600px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          eventPropGetter={eventStyleGetter}
          components={{
            event: customEvent,
          }}
          view={view}
          onView={setView}
          date={currentDate}
          onNavigate={setCurrentDate}
          views={["month", "week", "day", "agenda"]}
          step={30}
          timeslots={2}
          min={new Date(2024, 0, 1, 8, 0)} // 8 AM
          max={new Date(2024, 0, 1, 22, 0)} // 10 PM
          formats={{
            timeGutterFormat: (date) => format(date, "HH:mm"),
            eventTimeRangeFormat: ({ start, end }) =>
              `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`,
            dayFormat: (date) => format(date, "EEE, MMM dd"),
            monthHeaderFormat: (date) => format(date, "MMMM yyyy"),
          }}
          popup
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
        />
      </div>
    </div>
  );
};

export default CalendarSlots;
