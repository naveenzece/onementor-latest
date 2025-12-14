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
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { useRouter } from "next/navigation";
import { getMentorProfile } from "@/services/mentor/mentor";

export default function CoachDashboard() {
  const router = useRouter();
  const [coachName, setCoachName] = useState('Coach');
  const [loading, setLoading] = useState(true);
  
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
    
    // Fetch setup progress
    fetchSetupProgress();
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
      
      // Account setup - for now set to false (will be implemented later)
      const accountComplete = false;
      
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

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12 md:mb-16 lg:mb-20">
          <div className="card card-compact bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Total Clients</p>
                <p className="text-3xl md:text-4xl font-bold text-emerald-600">45</p>
              </div>
              <UsersIcon className="w-14 h-14 text-emerald-400 opacity-50" />
            </div>
          </div>
          
          <div className="card card-compact bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Sessions This Month</p>
                <p className="text-3xl md:text-4xl font-bold text-[var(--primary)]">28</p>
              </div>
              <CalendarIcon className="w-14 h-14 text-blue-400 opacity-50" />
            </div>
          </div>

          <div className="card card-compact bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Pending Requests</p>
                <p className="text-3xl md:text-4xl font-bold text-purple-600">5</p>
              </div>
              <BellIcon className="w-14 h-14 text-purple-400 opacity-50" />
            </div>
          </div>

          <div className="card card-compact bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Total Earnings</p>
                <p className="text-3xl md:text-4xl font-bold text-amber-600">$2.4K</p>
              </div>
              <BanknotesIcon className="w-14 h-14 text-amber-400 opacity-50" />
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
            <div className="space-y-5">
              <div className="flex items-center justify-between p-5 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-semibold">
                    JD
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">John Doe</p>
                    <p className="text-sm text-gray-500">Career Coaching</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 mb-1">Today</p>
                  <p className="text-sm text-gray-500">2:00 PM</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-5 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
                    SA
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Sarah Anderson</p>
                    <p className="text-sm text-gray-500">Life Coaching</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 mb-1">Tomorrow</p>
                  <p className="text-sm text-gray-500">10:00 AM</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-5 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold">
                    MK
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Mike Kim</p>
                    <p className="text-sm text-gray-500">Fitness Coaching</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 mb-1">Wed</p>
                  <p className="text-sm text-gray-500">3:30 PM</p>
                </div>
              </div>
            </div>
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
