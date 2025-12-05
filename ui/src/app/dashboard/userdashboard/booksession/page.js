"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { toastrSuccess, toastrError } from "@/components/ui/toaster/toaster";
import { ArrowLeftIcon, CalendarDaysIcon, ClockIcon, CurrencyRupeeIcon } from "@heroicons/react/24/outline";

const BookSessionPage = () => {
  const [coach, setCoach] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [sessionType, setSessionType] = useState("standard");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const coachId = searchParams.get('coachId');

  // Mock coach data based on ID
  const mockCoaches = {
    1: {
      id: 1,
      name: "Dr. Sarah Johnson",
      expertise: "Career Development",
      skills: "Leadership, Communication, Strategic Planning",
      rating: 4.9,
      sessions_completed: 150,
      price: "₹1500",
      bio: "Experienced career coach with 10+ years helping professionals advance their careers.",
      image: "/images/coach1.jpg"
    },
    2: {
      id: 2,
      name: "Michael Chen",
      expertise: "Technology Leadership",
      skills: "Software Development, Team Management, Product Strategy",
      rating: 4.8,
      sessions_completed: 120,
      price: "₹2000",
      bio: "Tech industry veteran specializing in leadership development for software teams.",
      image: "/images/coach2.jpg"
    },
    3: {
      id: 3,
      name: "Emily Rodriguez",
      expertise: "Personal Development",
      skills: "Goal Setting, Time Management, Work-Life Balance",
      rating: 4.9,
      sessions_completed: 200,
      price: "₹1200",
      bio: "Certified life coach focused on helping individuals achieve personal and professional goals.",
      image: "/images/coach3.jpg"
    },
    4: {
      id: 4,
      name: "David Kumar",
      expertise: "Business Strategy",
      skills: "Entrepreneurship, Marketing, Financial Planning",
      rating: 4.7,
      sessions_completed: 80,
      price: "₹2500",
      bio: "Serial entrepreneur and business consultant with expertise in scaling startups.",
      image: "/images/coach4.jpg"
    },
    5: {
      id: 5,
      name: "Lisa Thompson",
      expertise: "Communication Skills",
      skills: "Public Speaking, Negotiation, Conflict Resolution",
      rating: 4.8,
      sessions_completed: 160,
      price: "₹1800",
      bio: "Communication expert helping professionals improve their interpersonal skills.",
      image: "/images/coach5.jpg"
    },
    6: {
      id: 6,
      name: "James Wilson",
      expertise: "Financial Planning",
      skills: "Investment Strategy, Retirement Planning, Wealth Management",
      rating: 4.9,
      sessions_completed: 90,
      price: "₹3000",
      bio: "Certified financial planner with 15+ years of experience in wealth management.",
      image: "/images/coach6.jpg"
    }
  };

  useEffect(() => {
    if (coachId && mockCoaches[coachId]) {
      setCoach(mockCoaches[coachId]);
    } else {
      router.push('/dashboard/userdashboard/coachdiscovery');
    }
  }, [coachId, router]);

  const sessionTypes = [
    { id: "quick", name: "Quick Session", duration: "30 min", price: "₹1000" },
    { id: "standard", name: "Standard Session", duration: "60 min", price: coach?.price || "₹1500" },
    { id: "extended", name: "Extended Session", duration: "90 min", price: "₹2500" }
  ];

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toastrError("Please select both date and time");
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
      // First, get available slots for the mentor
      const slotsRes = await fetch(
        `http://localhost:8001/api/mentor/slots/mentor/${coachId}?date=${selectedDate}&is_booked=0&is_active=1`,
        { credentials: 'include' }
      );
      
      if (!slotsRes.ok) {
        throw new Error("Failed to fetch available slots");
      }
      
      const slots = await slotsRes.json();
      
      // Find matching slot
      const matchingSlot = slots.find(slot => {
        const slotTime = slot.start_time.substring(0, 5); // Get HH:MM format
        return slotTime === selectedTime;
      });

      if (!matchingSlot) {
        toastrError("Selected slot is no longer available. Please choose another time.");
        setLoading(false);
        return;
      }

      // Create booking
      const bookingData = {
        user_id: parseInt(userId),
        mentor_id: parseInt(coachId),
        slot_id: matchingSlot.id,
        notes: `Session type: ${sessionType}`
      };

      const bookingRes = await fetch("http://localhost:8001/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(bookingData),
      });

      if (!bookingRes.ok) {
        const error = await bookingRes.json();
        throw new Error(error.error || "Failed to create booking");
      }

      const bookingResult = await bookingRes.json();
      
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
                <p className="text-gray-600 text-sm">{coach.bio}</p>
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
                  <span className="text-gray-600">Starting Price:</span>
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
              <div className="mb-6">
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
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-professional"
                />
              </div>

              {/* Time Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <ClockIcon className="w-4 h-4 inline mr-1" />
                  Select Time
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      className={`p-3 text-sm rounded-lg border transition-all ${
                        selectedTime === time
                          ? 'border-[var(--primary)] bg-blue-50 text-[var(--primary)]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Booking Summary */}
              {selectedDate && selectedTime && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Coach:</span> {coach.name}</p>
                    <p><span className="text-gray-600">Session:</span> {sessionTypes.find(t => t.id === sessionType)?.name}</p>
                    <p><span className="text-gray-600">Date:</span> {selectedDate}</p>
                    <p><span className="text-gray-600">Time:</span> {selectedTime}</p>
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
                disabled={!selectedDate || !selectedTime || loading}
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