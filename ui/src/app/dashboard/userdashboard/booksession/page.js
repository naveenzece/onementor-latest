"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { toastrSuccess, toastrError } from "@/components/ui/toaster/toaster";
import { ArrowLeftIcon, CalendarDaysIcon, ClockIcon, CurrencyRupeeIcon } from "@heroicons/react/24/outline";
import { getMentorProfile, getSlotsByMentor } from "@/services/mentor/mentor";
import { bookSlot } from "@/services/booking/booking";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BookSessionPage = () => {
  const [coach, setCoach] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sessionType, setSessionType] = useState("standard");
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [datesWithSlots, setDatesWithSlots] = useState([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const coachId = searchParams.get('coachId');

  useEffect(() => {
    const fetchCoachData = async () => {
      if (!coachId) {
        toastrError("No coach selected");
        router.push('/dashboard/userdashboard/coachdiscovery');
        return;
      }

      try {
        const response = await getMentorProfile(coachId);
        
        if (response.error) {
          toastrError(response.error || "Failed to load coach information");
          router.push('/dashboard/userdashboard/coachdiscovery');
          return;
        }

        const mentor = response;
        
        // Handle skills - can be JSON string, array, or null
        let skillsText = '';
        if (mentor.skills) {
          try {
            const skillsArray = typeof mentor.skills === 'string' 
              ? JSON.parse(mentor.skills) 
              : mentor.skills;
            skillsText = Array.isArray(skillsArray) 
              ? skillsArray.join(', ') 
              : (typeof mentor.skills === 'string' ? mentor.skills : '');
          } catch (e) {
            skillsText = typeof mentor.skills === 'string' ? mentor.skills : '';
          }
        }

        // Transform API data to match component expectations
        const coachData = {
          id: mentor.user_id,
          name: mentor.name || mentor.username || 'Unknown',
          expertise: mentor.category || 'Not specified',
          skills: skillsText,
          rating: mentor.rating || 0,
          sessions_completed: mentor.total_sessions || 0,
          price: mentor.hourly_rate ? `₹${parseFloat(mentor.hourly_rate).toLocaleString('en-IN')}` : '₹0',
          bio: mentor.bio || '',
          hourly_rate: mentor.hourly_rate || 0
        };

        setCoach(coachData);
      } catch (error) {
        console.error("Error fetching coach data:", error);
        toastrError("Failed to load coach information");
        router.push('/dashboard/userdashboard/coachdiscovery');
      }
    };

    fetchCoachData();
  }, [coachId, router]);

  // Fetch all available slots to highlight dates in calendar
  useEffect(() => {
    const fetchAllAvailableSlots = async () => {
      if (!coachId) return;

      try {
        const allSlotsResponse = await getSlotsByMentor(coachId, {
          is_booked: 0,
          is_active: 1
        });

        if (allSlotsResponse.error) {
          console.error("Error fetching all slots:", allSlotsResponse.error);
          return;
        }

        const allSlots = Array.isArray(allSlotsResponse) ? allSlotsResponse : [];
        
        console.log("All slots from API:", JSON.stringify(allSlots, null, 2));
        
        // Extract unique dates from slots
        // API now returns dates in YYYY-MM-DD format
        const uniqueDates = new Set();
        allSlots.forEach(slot => {
          if (slot.date) {
            // API should return date as YYYY-MM-DD string
            let dateStr = '';
            
            if (typeof slot.date === 'string') {
              // Extract YYYY-MM-DD from string (handle ISO format if any)
              dateStr = slot.date.split('T')[0].split(' ')[0];
            } else if (slot.date instanceof Date) {
              // Fallback: format Date object (shouldn't happen with API fix)
              const year = slot.date.getFullYear();
              const month = String(slot.date.getMonth() + 1).padStart(2, '0');
              const day = String(slot.date.getDate()).padStart(2, '0');
              dateStr = `${year}-${month}-${day}`;
            }
            
            // Validate and add date
            if (dateStr && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              uniqueDates.add(dateStr);
              console.log("Added date:", dateStr, "from slot id:", slot.id);
            } else {
              console.warn("Invalid date format:", slot.date, "from slot:", slot);
            }
          }
        });

        console.log("Unique dates with slots:", Array.from(uniqueDates).sort());

        // Convert to Date objects for react-datepicker (using local timezone)
        const datesArray = Array.from(uniqueDates).map(dateStr => {
          const [year, month, day] = dateStr.split('-').map(Number);
          // Create date at noon local time to avoid timezone edge cases
          return new Date(year, month - 1, day, 12, 0, 0);
        });

        console.log("Dates array for datepicker:", datesArray);
        setDatesWithSlots(datesArray);
      } catch (error) {
        console.error("Error fetching all available slots:", error);
      }
    };

    fetchAllAvailableSlots();
  }, [coachId]);

  // Fetch available slots when date is selected
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedDate || !coachId) {
        setAvailableSlots([]);
        setSelectedSlot(null);
        return;
      }

      setLoadingSlots(true);
      try {
        // Format date as YYYY-MM-DD
        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        const dateString = formatDate(selectedDate);
        console.log("Fetching slots for mentor:", coachId, "date:", dateString);
        
        const slotsResponse = await getSlotsByMentor(coachId, {
          date: dateString,
          is_booked: 0,
          is_active: 1
        });

        console.log("Slots response:", slotsResponse);

        if (slotsResponse.error) {
          console.error("Error fetching slots:", slotsResponse.error);
          setAvailableSlots([]);
          return;
        }

        const slots = Array.isArray(slotsResponse) ? slotsResponse : [];
        console.log("Parsed slots:", slots);
        
        // Format slots to extract time and create time slot objects
        const formattedSlots = slots.map(slot => {
          // Handle time format - could be "HH:MM:SS" or "HH:MM"
          let startTimeStr = '';
          let endTimeStr = '';
          
          if (slot.start_time) {
            startTimeStr = slot.start_time.includes(':') 
              ? slot.start_time.substring(0, 5) // Get HH:MM from "HH:MM:SS"
              : slot.start_time;
          }
          
          if (slot.end_time) {
            endTimeStr = slot.end_time.includes(':')
              ? slot.end_time.substring(0, 5) // Get HH:MM from "HH:MM:SS"
              : slot.end_time;
          }
          
          return {
            id: slot.id,
            start_time: startTimeStr,
            end_time: endTimeStr,
            date: slot.date,
            slot_id: slot.id
          };
        });

        console.log("Formatted slots:", formattedSlots);
        setAvailableSlots(formattedSlots);
        setSelectedSlot(null);
      } catch (error) {
        console.error("Error fetching available slots:", error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDate, coachId]);

  const sessionTypes = [
    { 
      id: "quick", 
      name: "Quick Session", 
      duration: "30 min", 
      price: coach?.hourly_rate ? `₹${Math.round(parseFloat(coach.hourly_rate) / 2).toLocaleString('en-IN')}` : "₹0" 
    },
    { 
      id: "standard", 
      name: "Standard Session", 
      duration: "60 min", 
      price: coach?.price || (coach?.hourly_rate ? `₹${parseFloat(coach.hourly_rate).toLocaleString('en-IN')}` : "₹0") 
    },
    { 
      id: "extended", 
      name: "Extended Session", 
      duration: "90 min", 
      price: coach?.hourly_rate ? `₹${Math.round(parseFloat(coach.hourly_rate) * 1.5).toLocaleString('en-IN')}` : "₹0" 
    }
  ];

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot) {
      toastrError("Please select both date and time slot");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      toastrError("Please login first");
      router.push("/login");
      return;
    }

    setLoading(true);
    
    try {
      // Create booking
      const bookingData = {
        user_id: parseInt(userId),
        mentor_id: parseInt(coachId),
        slot_id: selectedSlot.id,
        notes: `Session type: ${sessionType}`
      };

      const bookingResult = await bookSlot(bookingData);

      if (bookingResult.error) {
        throw new Error(bookingResult.error || "Failed to create booking");
      }
      
        // Redirect to payment if payment URL is provided
        if (bookingResult.payment && bookingResult.payment.payment_url) {
          // Store booking info for after payment
          localStorage.setItem("pendingBooking", JSON.stringify({
            bookingId: bookingResult.booking.id,
            orderId: bookingResult.payment.order_id
          }));
          
          toastrSuccess("Booking created! Redirecting to payment...");
          
          // Redirect to payment
          setTimeout(() => {
            window.location.href = bookingResult.payment.payment_url;
          }, 1000);
        } else {
          toastrSuccess("Booking created! Please complete payment.");
          router.push(`/dashboard/userdashboard/userpayment?bookingId=${bookingResult.booking.id}`);
        }
      } catch (err) {
        console.error("Booking error:", err);
        toastrError(err.message || "Failed to book session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!coach) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow container-professional py-8">
          <div className="text-center">
            <div className="spinner mb-4"></div>
            <p className="text-gray-600">Loading coach information...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow container-professional py-8 md:py-10 lg:py-12 fade-in">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard/userdashboard/coachdiscovery")}
            className="flex items-center text-gray-600 hover:text-[var(--primary)] mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Coaches
          </button>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Book Session with {coach.name}
          </h1>
          <p className="text-gray-600">Schedule your personalized coaching session</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coach Info */}
          <div className="lg:col-span-1">
            <div className="card spacing-generous">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">
                    {coach.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{coach.name}</h3>
                <p className="text-[var(--primary)] font-semibold mb-3">{coach.expertise}</p>
                <p 
                  className="text-gray-600 text-sm line-clamp-2 cursor-help" 
                  title={coach.bio}
                >
                  {coach.bio}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rating:</span>
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span className="font-semibold">{coach.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Sessions Completed:</span>
                  <span className="font-semibold">{coach.sessions_completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Price(1hr):</span>
                  <span className="font-bold text-[var(--primary)]">{coach.price}</span>
                </div>
              </div>

              {coach.skills && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {coach.skills.split(',').map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="card spacing-generous">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule Your Session</h2>

              {/* Session Type */}
              {/* <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Session Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {sessionTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        sessionType === type.id
                          ? 'border-[var(--primary)] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSessionType(type.id)}
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">{type.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{type.duration}</p>
                      <p className="text-lg font-bold text-[var(--primary)]">{type.price}</p>
                    </div>
                  ))}
                </div>
              </div> */}

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                  Select Date
                </label>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  minDate={new Date()}
                  dateFormat="MMMM dd, yyyy"
                  className="input-professional w-full"
                  placeholderText="Select a date"
                  highlightDates={datesWithSlots}
                  renderDayContents={(dayOfMonth, date) => {
                    if (!date) return dayOfMonth;
                    // Format date as YYYY-MM-DD for comparison
                    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    
                    // Compare with dates from API (stored as YYYY-MM-DD strings)
                    const hasSlot = datesWithSlots.some(d => {
                      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                      return dStr === dateStr;
                    });
                    
                    return (
                      <div className="relative">
                        {dayOfMonth}
                        {hasSlot && (
                          <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-[var(--primary)] rounded-full"></span>
                        )}
                      </div>
                    );
                  }}
                />
              </div>

              {/* Time Selection - Available Slots in One Line */}
              {selectedDate && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <ClockIcon className="w-4 h-4 inline mr-1" />
                    Select Time Slot {!selectedDate && <span className="text-gray-400 text-xs">(Select a date first)</span>}
                  </label>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="spinner mr-2"></div>
                      <span className="text-gray-600">Loading available slots...</span>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.id}
                          className={`px-4 py-3 text-sm rounded-lg border transition-all whitespace-nowrap flex-shrink-0 ${
                            selectedSlot?.id === slot.id
                              ? 'border-[var(--primary)] bg-blue-50 text-[var(--primary)] font-semibold'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          {slot.start_time} - {slot.end_time}
                        </button>
                      ))}
                    </div>
                  ) : selectedDate ? (
                    <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-600 mb-2">No available slots for this date</p>
                      <p className="text-sm text-gray-500">Please select another date or contact the coach</p>
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-600">Please select a date to see available time slots</p>
                    </div>
                  )}
                </div>
              )}

              {/* Booking Summary */}
              {selectedDate && selectedSlot && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Coach:</span> {coach.name}</p>
                    <p><span className="text-gray-600">Session:</span> {sessionTypes.find(t => t.id === sessionType)?.name}</p>
                    <p><span className="text-gray-600">Date:</span> {selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p><span className="text-gray-600">Time:</span> {selectedSlot.start_time} - {selectedSlot.end_time}</p>
                    <p><span className="text-gray-600">Duration:</span> {sessionTypes.find(t => t.id === sessionType)?.duration}</p>
                    <p className="font-semibold">
                      <span className="text-gray-600">Total:</span> 
                      <CurrencyRupeeIcon className="w-4 h-4 inline mx-1" />
                      {sessionTypes.find(t => t.id === sessionType)?.price}
                    </p>
                  </div>
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={handleBooking}
                disabled={!selectedDate || !selectedSlot || loading}
                className="btn btn-primary btn-lg w-full"
              >
                {loading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Booking Session...
                  </>
                ) : (
                  'Book Session'
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookSessionPage;