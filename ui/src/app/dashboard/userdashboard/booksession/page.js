"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { toastrSuccess, toastrError } from "@/components/ui/toaster/toaster";
import { ArrowLeftIcon, CalendarDaysIcon, ClockIcon, CurrencyRupeeIcon } from "@heroicons/react/24/outline";
import { getMentorProfile, getSlotsByMentor } from "@/services/mentor/mentor";
import { getCalendarStatus, getCalendarAuthUrl } from "@/services/calendar/userCalendar";
import { createBooking } from "@/services/payment/payment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BookSessionPage = () => {
  const [coach, setCoach] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [sessionType, setSessionType] = useState("standard");
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [datesWithSlots, setDatesWithSlots] = useState([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const coachId = searchParams.get('coachId');

  const [calendarStatus, setCalendarStatus] = useState({ connected: false, email: null, connectedAt: null, loading: true });
  const [pendingSlotIds, setPendingSlotIds] = useState(null);

  async function fetchCalendarStatus(userId) {
    try {
      setCalendarStatus(prev => ({ ...prev, loading: true }));
      const resp = await getCalendarStatus(userId);
      if (resp && resp.error) {
        setCalendarStatus({ connected: false, email: null, connectedAt: null, loading: false });
        return;
      }
      setCalendarStatus({
        connected: resp?.connected || false,
        email: resp?.email || null,
        connectedAt: resp?.connectedAt || null,
        loading: false
      });
    } catch (err) {
      console.error('Error fetching calendar status', err);
      setCalendarStatus(prev => ({ ...prev, loading: false }));
    }
  }

  const handleConnectCalendar = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      toastrError('Please login to connect your calendar');
      router.push('/login');
      return;
    }

    try {
      localStorage.setItem('pendingBookingDraft', JSON.stringify({
        coachId,
        selectedDate: selectedDate ? selectedDate.toISOString() : null,
        selectedSlotIds: selectedSlots.map(s => s.id),
        sessionType
      }));

      const resp = await getCalendarAuthUrl(userId, {
        returnTo: 'booking',
        coachId,
        selectedDate: selectedDate ? selectedDate.toISOString() : null,
        selectedSlotIds: selectedSlots.map(s => s.id),
        sessionType
      });
      if (resp.error) {
        toastrError(resp.error || 'Failed to get Google authorization URL');
        return;
      }

      window.location.href = resp.authUrl;
    } catch (err) {
      console.error('Error initiating calendar connect', err);
      toastrError('Failed to initiate calendar connection');
    }
  };

  useEffect(() => {
    const handleCalendarUrlParams = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const userId = localStorage.getItem("userId");

      if (userId) {
        await fetchCalendarStatus(userId);
      }

      if (urlParams.get('calendar_connected') === 'true') {
        toastrSuccess('Google Calendar connected successfully!');
        const selectedDateParam = urlParams.get('selectedDate');
        const selectedSlotIdsParam = urlParams.get('selectedSlotIds') || urlParams.get('selectedSlotId');
        const sessionTypeParam = urlParams.get('sessionType');

        if (selectedDateParam) {
          try {
            setSelectedDate(new Date(selectedDateParam));
          } catch (e) {
            console.error('Invalid selectedDate param:', e);
          }
        }
        if (sessionTypeParam) setSessionType(sessionTypeParam);
        if (selectedSlotIdsParam) {
          // support comma-separated or single id
          const ids = String(selectedSlotIdsParam).split(',').map(i => i.trim()).filter(Boolean);
          setPendingSlotIds(ids);
        }

        if (!selectedDateParam && !selectedSlotIdsParam && !sessionTypeParam) {
          const draft = localStorage.getItem('pendingBookingDraft');
          if (draft) {
            try {
              const parsed = JSON.parse(draft);
              if (parsed.selectedDate) setSelectedDate(new Date(parsed.selectedDate));
              if (parsed.sessionType) setSessionType(parsed.sessionType);
              if (parsed.selectedSlotIds) {
                const ids = Array.isArray(parsed.selectedSlotIds) ? parsed.selectedSlotIds.map(String) : String(parsed.selectedSlotIds).split(',').map(i => i.trim()).filter(Boolean);
                setPendingSlotIds(ids);
              }
            } catch (e) {
              console.error('Failed to parse pending booking draft', e);
            }
          }
        }

        const cleanParams = new URLSearchParams(window.location.search);
        cleanParams.delete('calendar_connected');
        cleanParams.delete('selectedDate');
        cleanParams.delete('selectedSlotId');
        cleanParams.delete('selectedSlotIds');
        cleanParams.delete('sessionType');
        const newPath = window.location.pathname + (cleanParams.toString() ? `?${cleanParams.toString()}` : '');
        window.history.replaceState({}, document.title, newPath);
        if (userId) await fetchCalendarStatus(userId);
      }

      if (urlParams.get('calendar_error')) {
        toastrError(`Calendar connection failed: ${urlParams.get('calendar_error')}`);
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search.replace(/([?&])calendar_error=[^&]*(&|$)/, '$1').replace(/\?$/, ''));
      }
    };

    handleCalendarUrlParams();

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

        const uniqueDates = new Set();
        allSlots.forEach(slot => {
          if (slot.date) {
            let dateStr = '';

            if (typeof slot.date === 'string') {
              dateStr = slot.date.split('T')[0].split(' ')[0];
            } else if (slot.date instanceof Date) {
              const year = slot.date.getFullYear();
              const month = String(slot.date.getMonth() + 1).padStart(2, '0');
              const day = String(slot.date.getDate()).padStart(2, '0');
              dateStr = `${year}-${month}-${day}`;
            }

            if (dateStr && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              uniqueDates.add(dateStr);
            } else {
              console.warn("Invalid date format:", slot.date, "from slot:", slot);
            }
          }
        });

        const datesArray = Array.from(uniqueDates).map(dateStr => {
          const [year, month, day] = dateStr.split('-').map(Number);
          return new Date(year, month - 1, day, 12, 0, 0);
        });

        setDatesWithSlots(datesArray);
      } catch (error) {
        console.error("Error fetching all available slots:", error);
      }
    };

    fetchAllAvailableSlots();
  }, [coachId]);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedDate || !coachId) {
        setAvailableSlots([]);
        setSelectedSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        const dateString = formatDate(selectedDate);
        const slotsResponse = await getSlotsByMentor(coachId, {
          date: dateString,
          is_booked: 0,
          is_active: 1
        });

        if (slotsResponse.error) {
          console.error("Error fetching slots:", slotsResponse.error);
          setAvailableSlots([]);
          return;
        }

        const slots = Array.isArray(slotsResponse) ? slotsResponse : [];

        const formattedSlots = slots.map(slot => {
          let startTimeStr = '';
          let endTimeStr = '';

          if (slot.start_time) {
            startTimeStr = slot.start_time.includes(':')
              ? slot.start_time.substring(0, 5)
              : slot.start_time;
          }

          if (slot.end_time) {
            endTimeStr = slot.end_time.includes(':')
              ? slot.end_time.substring(0, 5)
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

        setAvailableSlots(formattedSlots);
        setSelectedSlots([]); // reset selection on date change
      } catch (error) {
        console.error("Error fetching available slots:", error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDate, coachId]);

  useEffect(() => {
    if (!pendingSlotIds || !availableSlots || availableSlots.length === 0) return;
    const idsSet = new Set(pendingSlotIds.map(String));
    const found = availableSlots.filter(s => idsSet.has(String(s.id)));
    if (found.length > 0) {
      setSelectedSlots(found);
      setPendingSlotIds(null);
      localStorage.removeItem('pendingBookingDraft');
    }
  }, [availableSlots, pendingSlotIds]);

  const toggleSelectedSlot = (slot) => {
    setSelectedSlots(prev => {
      const exists = prev.find(s => String(s.id) === String(slot.id));
      if (exists) {
        return prev.filter(s => String(s.id) !== String(slot.id));
      } else {
        return [...prev, slot];
      }
    });
  };

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

  const calculateTotalHours = (slots) => {
    return slots.reduce((acc, slot) => {
      if (!slot.start_time || !slot.end_time) return acc;
      const [startH, startM] = slot.start_time.split(':').map(Number);
      const [endH, endM] = slot.end_time.split(':').map(Number);
      const startDec = startH + startM / 60;
      const endDec = endH + endM / 60;
      return acc + (endDec - startDec);
    }, 0);
  };

  const handleBooking = async () => {
    if (!selectedDate || selectedSlots.length === 0) {
      toastrError("Please select a date and at least one time slot");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      toastrError("Please login first");
      router.push("/login");
      return;
    }

    if (!calendarStatus.connected) {
      toastrError("Please connect your Google Calendar to book a session");
      return;
    }

    setLoading(true);

    try {
      const perSlotRate = parseFloat(coach?.hourly_rate || 0) || 0;
      const totalHours = calculateTotalHours(selectedSlots);
      const amount = Math.round(perSlotRate * totalHours);

      const bookingData = {
        user_id: parseInt(userId),
        mentor_id: parseInt(coachId),
        slot_ids: selectedSlots.map(s => s.id),
        amount,
        remark: `Booking ${selectedSlots.length} session(s) - ${sessionType}`
      };

      const result = await createBooking(bookingData);

      if (result.error) {
        throw new Error(result.error);
      }
      toastrSuccess(result.message || "Booking request created. Redirecting to payment...");

      // If API returns a payment URL, redirect
      const paymentUrl = result?.payment_url || result?.payment?.payment_url || result?.payment_url_redirect;
      const bookingId = result?.booking?.id || result?.booking_id || result?.id;

      if (paymentUrl) {
        localStorage.setItem("pendingBooking", JSON.stringify({
          bookingId: bookingId || null,
          orderId: result?.payment?.order_id || result?.order_id || null
        }));
        setTimeout(() => {
          window.location.href = paymentUrl;
        }, 800);
        return;
      }

      if (bookingId) {
        router.push(`/dashboard/userdashboard/userpayment?bookingId=${bookingId}`);
      } else {
        router.push("/dashboard/user");
      }
    } catch (err) {
      console.error("Booking error:", err);
      toastrError(err.message || "Failed to create booking. Please try again.");
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

  const perSlotRateDisplay = coach?.hourly_rate ? `₹${parseFloat(coach.hourly_rate).toLocaleString('en-IN')}` : '₹0';
  const amountTotal = Math.round((parseFloat(coach?.hourly_rate || 0) || 0) * calculateTotalHours(selectedSlots));

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow container-professional py-8 md:py-10 lg:py-12 fade-in">
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
                  <span className="font-bold text-[var(--primary)]">{perSlotRateDisplay}</span>
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

          <div className="lg:col-span-2">
            <div className="card spacing-generous">
              <div className="mb-6">
                {calendarStatus.loading ? (
                  <div className="p-4 flex items-center bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="spinner mr-3" style={{ width: 20, height: 20 }}></div>
                    <div className="text-sm text-gray-700">Checking Google Calendar connection...</div>
                  </div>
                ) : calendarStatus.connected ? (
                  <div className="p-4 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <div className="font-semibold text-green-900">Google Calendar Connected</div>
                      <div className="text-sm text-green-700">{calendarStatus.email || ''}</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="mr-4">
                        <div className="font-semibold text-yellow-900">Connect Google Calendar</div>
                        <div className="text-sm text-yellow-700">You must connect your Google Calendar before booking to receive invites and meeting links.</div>
                      </div>
                      <div>
                        <button
                          onClick={handleConnectCalendar}
                          className="btn btn-primary px-4 py-2"
                        >
                          Connect Calendar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule Your Session</h2>

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
                    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    const hasSlot = datesWithSlots.some(d => {
                      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                      return dStr === dateStr;
                    });

                    return (
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full mx-auto ${hasSlot ? 'bg-green-500 text-white font-medium shadow-sm' : ''}`}>
                        {dayOfMonth}
                      </div>
                    );
                  }}
                />
              </div>

              {selectedDate && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <ClockIcon className="w-4 h-4 inline mr-1" />
                    Select Time Slot(s)
                  </label>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="spinner mr-2"></div>
                      <span className="text-gray-600">Loading available slots...</span>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
                      {availableSlots.map((slot) => {
                        const isSelected = selectedSlots.some(s => String(s.id) === String(slot.id));
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            className={`px-4 py-3 text-sm rounded-lg border transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-2 ${isSelected
                              ? 'border-[var(--primary)] bg-blue-50 text-[var(--primary)] font-semibold'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            onClick={() => toggleSelectedSlot(slot)}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                              className="form-checkbox h-4 w-4"
                              aria-hidden
                            />
                            <span>{slot.start_time} - {slot.end_time}</span>
                          </button>
                        );
                      })}
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

              {selectedDate && selectedSlots.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Coach:</span> {coach.name}</p>
                    <p><span className="text-gray-600">Session type:</span> {sessionTypes.find(t => t.id === sessionType)?.name}</p>
                    <p><span className="text-gray-600">Date:</span> {selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <div>
                      <span className="text-gray-600">Time slots:</span>
                      <ul className="ml-4 list-disc">
                        {selectedSlots.map(s => (
                          <li key={s.id} className="text-gray-800">{s.start_time} - {s.end_time}</li>
                        ))}
                      </ul>
                    </div>
                    <p className="font-semibold">
                      <span className="text-gray-600">Hourly Rate:</span>
                      <CurrencyRupeeIcon className="w-4 h-4 inline mx-1" />
                      {perSlotRateDisplay}
                    </p>
                    <p className="font-semibold">
                      <span className="text-gray-600">Total:</span>
                      <CurrencyRupeeIcon className="w-4 h-4 inline mx-1" />
                      {`₹${amountTotal.toLocaleString('en-IN')}`}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={!selectedDate || selectedSlots.length === 0 || loading || calendarStatus.loading || !calendarStatus.connected}
                className="btn btn-primary btn-lg w-full"
              >
                {loading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Booking Session...
                  </>
                ) : (
                  `Book ${selectedSlots.length > 0 ? `${selectedSlots.length} Session${selectedSlots.length > 1 ? 's' : ''}` : 'Session'}`
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