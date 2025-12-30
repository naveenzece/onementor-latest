"use client";
import { useState, useEffect } from "react";
import Card from "@/components/card/card";
import SetupProgress from "@/components/coach/SetupProgress";
import {
  UserIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  BellIcon,
  VideoCameraIcon,
  BanknotesIcon,
  UsersIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import { Clock, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { useRouter } from "next/navigation";
import { getMentorProfile, getSlotsByMentor, getMentorUpcomingSessions } from "@/services/mentor/mentor";
import { isVPAValid } from "@/services/profileService";

export default function CoachDashboard() {
  const router = useRouter();
  const [coachName, setCoachName] = useState('Coach');
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [monthStats, setMonthStats] = useState({
    total: 0,
    available: 0,
    booked: 0
  });
  const [upcomingSessions, setUpcomingSessions] = useState([]);

  // Setup progress state
  const [setupProgress, setSetupProgress] = useState({
    profileComplete: false,
    accountComplete: false,
    slotComplete: false,
    registrationFeeComplete: false
  });

  useEffect(() => {
    // Get coach name from localStorage on client side only
    const name = localStorage.getItem('userName') || 'Coach';
    setCoachName(name);

    // Fetch setup progress and slots
    fetchSetupProgress();
    fetchSlots();
    fetchUpcomingSessions();
  }, []);

  const fetchSetupProgress = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setLoading(false);
        return;
      }

      // Fetch mentor profile
      const response = await getMentorProfile(userId);

      if (response.error) {
        // Profile doesn't exist yet, all are incomplete
        setSetupProgress({
          profileComplete: false,
          accountComplete: false,
          slotComplete: false,
          registrationFeeComplete: false // Ensure false by default
        });
        setLoading(false);
        return;
      }

      const profile = response;
      console.log(profile);

      // Check profile completion: needs username, category, bio, and skills
      let skillsValid = false;
      if (profile.skills) {
        try {
          // Handle skills as JSON string or array
          const skillsArray = typeof profile.skills === 'string'
            ? JSON.parse(profile.skills)
            : profile.skills;
          skillsValid = Array.isArray(skillsArray) && skillsArray.length > 0;
        } catch (e) {
          skillsValid = false;
        }
      }

      const profileComplete = !!(
        profile.username &&
        profile.username.trim() !== '' &&
        profile.category &&
        profile.category.trim() !== '' &&
        profile.bio &&
        profile.bio.trim() !== '' &&
        skillsValid
      );

      // Check slot setup completion: needs hourly_rate
      const slotComplete = !!(profile.hourly_rate && parseFloat(profile.hourly_rate) > 0);

      // Account setup - check VPA validation status
      const accountComplete = isVPAValid(profile);

      setSetupProgress({
        profileComplete,
        accountComplete,
        slotComplete,
        registrationFeeComplete: profile.registered
      });
    } catch (error) {
      console.error("Error fetching setup progress:", error);
      setSetupProgress({
        profileComplete: false,
        accountComplete: false,
        slotComplete: false,
        registrationFeeComplete: false // Ensure false by default
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const data = await getSlotsByMentor(userId);

      if (data.error) throw new Error(data.error);

      setSlots(data || []);

      // Calculate current month stats
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const currentMonthSlots = (data || []).filter(slot => {
        if (slot.is_active === 0 || slot.is_active === '0') return false;

        try {
          const slotDate = new Date(slot.date);
          return slotDate.getMonth() === currentMonth &&
            slotDate.getFullYear() === currentYear;
        } catch (e) {
          return false;
        }
      });

      // Calculate available slots: non-booked AND future slots only
      const availableSlots = currentMonthSlots.filter(slot => {
        if (slot.is_booked) return false;

        try {
          // Create end datetime for the slot
          const slotDate = new Date(slot.date);
          const endTimeParts = slot.end_time ? slot.end_time.split(':') : ['23', '59'];
          const [endHour, endMin] = endTimeParts.map(Number);

          const slotEndDateTime = new Date(slotDate);
          slotEndDateTime.setHours(endHour, endMin || 0, 0, 0);

          // Only count if slot end time is in the future
          return slotEndDateTime >= now;
        } catch (e) {
          return false;
        }
      });

      setMonthStats({
        total: currentMonthSlots.length,
        available: availableSlots.length,
        booked: currentMonthSlots.filter(s => s.is_booked).length
      });
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  const fetchUpcomingSessions = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const data = await getMentorUpcomingSessions(userId);

      if (data.error) throw new Error(data.error);

      setUpcomingSessions(data || []);
    } catch (error) {
      console.error("Error fetching upcoming sessions:", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  // Helper function to format date
  const formatSessionDate = (dateString) => {
    const sessionDate = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    sessionDate.setHours(0, 0, 0, 0);

    if (sessionDate.getTime() === today.getTime()) return "Today";
    if (sessionDate.getTime() === tomorrow.getTime()) return "Tomorrow";

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[sessionDate.getDay()];
  };

  // Helper function to get initials
  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const allSetupComplete =
    setupProgress.profileComplete &&
    setupProgress.accountComplete &&
    setupProgress.slotComplete &&
    setupProgress.registrationFeeComplete;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow container-professional py-12 md:py-16 lg:py-20 fade-in">
        {/* Welcome Section */}
        <div className="mb-12 md:mb-16 lg:mb-20">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-3">
                Coach Dashboard
              </h1>
              <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
                Welcome back, {coachName}! Manage your coaching sessions and grow your impact.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards - Current Month */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16 lg:mb-20">
          <div className="card card-compact bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Total Slots (This Month)</p>
                <p className="text-3xl md:text-4xl font-bold text-blue-600">{monthStats.total}</p>
              </div>
              <Clock className="w-14 h-14 text-blue-400 opacity-50" />
            </div>
          </div>

          <div className="card card-compact bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Available Slots</p>
                <p className="text-3xl md:text-4xl font-bold text-green-600">{monthStats.available}</p>
              </div>
              <CheckCircle className="w-14 h-14 text-green-400 opacity-50" />
            </div>
          </div>

          <div className="card card-compact bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Booked Slots</p>
                <p className="text-3xl md:text-4xl font-bold text-red-600">{monthStats.booked}</p>
              </div>
              <XCircle className="w-14 h-14 text-red-400 opacity-50" />
            </div>
          </div>
        </div>

        {/* Setup Progress Section */}
        {!loading && (
          <SetupProgress
            profileComplete={setupProgress.profileComplete}
            accountComplete={setupProgress.accountComplete}
            slotComplete={setupProgress.slotComplete}
            registrationFeeComplete={setupProgress.registrationFeeComplete}
          />
        )}

        {/* Main Features Section */}
        <div className="mb-12 md:mb-16 lg:mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 md:mb-10">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            <Card
              title="Profile Setup"
              description="Manage your professional profile and expertise"
              icon={<UserIcon className="w-8 h-8" />}
              link="/dashboard/coachdashboard/profile"
            />
            <Card
              title="Manage Schedule"
              description="Set your availability and time slots"
              icon={<ClipboardDocumentListIcon className="w-8 h-8" />}
              link={allSetupComplete ? "/dashboard/coachdashboard/manageschedule" : undefined}
              disabled={!allSetupComplete}
              disabledMessage="Complete setup tasks to unlock"
            />
            {/* <Card 
              title="View Requests" 
              description="Check pending session requests"
              icon={<CalendarIcon className="w-8 h-8" />} 
              link="/dashboard/coachdashboard/request" 
            /> */}
            {/* <Card 
              title="Manage Bookings" 
              description="Accept or decline session requests"
              icon={<BellIcon className="w-8 h-8" />} 
              link="/dashboard/coachdashboard/acceptdecline" 
            /> */}
            {/* <Card 
              title="Live Sessions" 
              description="Join and conduct coaching sessions"
              icon={<VideoCameraIcon className="w-8 h-8" />} 
              link="/dashboard/coachdashboard/livesession" 
            /> */}
            <Card
              title="Track Earnings"
              description="Monitor your income and performance"
              icon={<ChartBarIcon className="w-8 h-8" />}
              link="/dashboard/coachdashboard/coachEarnings"
            />
          </div>
        </div>

        {/* Upcoming Sessions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 mb-8">
          {/* Upcoming Sessions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
              <h2 className="text-lg font-bold text-gray-900">Upcoming Sessions</h2>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{upcomingSessions.length} Scheduled</span>
            </div>

            <div className="p-2">
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-10">
                  <CalendarIcon className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 font-medium">No sessions scheduled</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {upcomingSessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="p-4 hover:bg-gray-50/80 transition-colors rounded-xl group">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-100/50">
                            {getInitials(session.user_name || session.booked_by_name || "User")}
                          </div>
                          <div className="min-w-0">
                            <p className="text-base font-bold text-gray-900 truncate">
                              {session.user_name || session.booked_by_name || "User"}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                              <span className="font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
                                {formatSessionDate(session.date)}
                              </span>
                              <span>•</span>
                              <span>{session.start_time} - {session.end_time}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {session.meeting_link ? (
                            <a
                              href={session.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[11px] font-bold hover:bg-indigo-700 transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Join
                            </a>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded border border-gray-100">
                              No Link
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {upcomingSessions.length > 5 && (
                    <button
                      onClick={() => router.push('/dashboard/coachdashboard/sessions')}
                      className="w-full py-3 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 transition-colors uppercase tracking-widest"
                    >
                      View All Sessions
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          {/* <div className="card">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-6">
              <div className="flex items-center space-x-4 py-4 border-b border-gray-200">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CalendarIcon className="w-7 h-7 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-1">Session completed</p>
                  <p className="text-sm text-gray-500">with Emma Watson - 1 hour ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 py-4 border-b border-gray-200">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <BellIcon className="w-7 h-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-1">New booking request</p>
                  <p className="text-sm text-gray-500">from Robert Lee - 3 hours ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 py-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <BanknotesIcon className="w-7 h-7 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-1">Payment received</p>
                  <p className="text-sm text-gray-500">$150 - Yesterday</p>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </main>

      <Footer />
    </div>
  );
}
