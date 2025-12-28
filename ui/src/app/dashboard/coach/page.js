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
import { getMentorProfile, getSlotsByMentor } from "@/services/mentor/mentor";
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
    slotComplete: false
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
          slotComplete: false
        });
        setLoading(false);
        return;
      }

      const profile = response;

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
        slotComplete
      });
    } catch (error) {
      console.error("Error fetching setup progress:", error);
      setSetupProgress({
        profileComplete: false,
        accountComplete: false,
        slotComplete: false
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

      const data = await getSlotsByMentor(userId);

      if (data.error) throw new Error(data.error);

      // Filter for booked slots that are in the future
      const now = new Date();
      const upcoming = (data || [])
        .filter(slot => {
          if (!slot.is_booked || slot.is_active === 0 || slot.is_active === '0') return false;

          try {
            // Create end datetime for the slot
            const slotDate = new Date(slot.date);
            const endTimeParts = slot.end_time ? slot.end_time.split(':') : ['23', '59'];
            const [endHour, endMin] = endTimeParts.map(Number);

            const slotEndDateTime = new Date(slotDate);
            slotEndDateTime.setHours(endHour, endMin || 0, 0, 0);

            // Only include future sessions
            return slotEndDateTime >= now;
          } catch (e) {
            return false;
          }
        })
        .sort((a, b) => {
          // Sort by date and time
          const dateA = new Date(a.date + 'T' + a.start_time);
          const dateB = new Date(b.date + 'T' + b.start_time);
          return dateA - dateB;
        });

      setUpcomingSessions(upcoming);
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

  const allSetupComplete = setupProgress.profileComplete && setupProgress.accountComplete && setupProgress.slotComplete;

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
              //link={allSetupComplete ? "/dashboard/coachdashboard/manageschedule" : undefined}
              //disabled={!allSetupComplete}
              link="/dashboard/coachdashboard/manageschedule"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          {/* Upcoming Sessions */}
          <div className="card">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Upcoming Sessions</h2>

            {upcomingSessions.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming sessions</p>
                <p className="text-sm text-gray-400 mt-1">Your booked sessions will appear here</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {upcomingSessions.slice(0, 5).map((session, index) => {
                    const colors = [
                      { bg: 'bg-blue-50', border: 'border-blue-200', avatar: 'bg-blue-600' },
                      { bg: 'bg-green-50', border: 'border-green-200', avatar: 'bg-green-600' },
                      { bg: 'bg-purple-50', border: 'border-purple-200', avatar: 'bg-purple-600' },
                      { bg: 'bg-amber-50', border: 'border-amber-200', avatar: 'bg-amber-600' },
                      { bg: 'bg-pink-50', border: 'border-pink-200', avatar: 'bg-pink-600' },
                    ];
                    const color = colors[index % colors.length];

                    return (
                      <div key={session.id} className={`p-4 ${color.bg} rounded-lg border ${color.border}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-full ${color.avatar} text-white flex items-center justify-center font-semibold text-sm`}>
                              {getInitials(session.user_name || session.booked_by_name || "User")}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 mb-1">
                                {session.user_name || session.booked_by_name || "User"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {session.start_time} - {session.end_time}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900 mb-1">
                                {formatSessionDate(session.date)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                            {session.meeting_link ? (
                              <a
                                href={session.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                title="Join Meeting"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Join
                              </a>
                            ) : (
                              <button
                                disabled
                                className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed"
                                title="Meeting link not available"
                              >
                                <ExternalLink className="w-4 h-4" />
                                No Link
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {upcomingSessions.length > 5 && (
                  <button
                    onClick={() => router.push('/dashboard/coachdashboard/sessions')}
                    className="mt-6 w-full py-3 px-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all"
                  >
                    Show All ({upcomingSessions.length} sessions)
                  </button>
                )}
              </>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card">
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
