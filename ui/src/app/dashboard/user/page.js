"use client";
import { useState, useEffect } from "react";
import Card from "@/components/card/card";
import {
  UserIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUserStats } from "@/services/booking/booking";

export default function UserDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('User');
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeCoaches: 0,
    upcoming: 0,
    progress: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user name from localStorage on client side only
    const name = localStorage.getItem('userName') || 'User';
    setUserName(name);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const response = await getUserStats(userId);
      if (response && response.stats) {
        setStats(response.stats);
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow container-professional py-12 md:py-16 lg:py-20 fade-in">
        {/* Welcome Section */}
        <div className="mb-12 md:mb-16 lg:mb-20">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-3">
                Welcome back, {userName}!
              </h1>
              <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
                Continue your learning journey and achieve your goals
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12 md:mb-16 lg:mb-20">
          <div className="card card-compact bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Total Sessions</p>
                <p className="text-3xl md:text-4xl font-bold text-[var(--primary)]">{stats.totalSessions}</p>
              </div>
              <CalendarIcon className="w-14 h-14 text-blue-400 opacity-50" />
            </div>
          </div>

          <div className="card card-compact bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Active Coaches</p>
                <p className="text-3xl md:text-4xl font-bold text-green-600">{stats.activeCoaches}</p>
              </div>
              <UserIcon className="w-14 h-14 text-green-400 opacity-50" />
            </div>
          </div>

          <div className="card card-compact bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Upcoming</p>
                <p className="text-3xl md:text-4xl font-bold text-purple-600">{stats.upcoming}</p>
              </div>
              <CheckCircleIcon className="w-14 h-14 text-purple-400 opacity-50" />
            </div>
          </div>

          <div className="card card-compact bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Progress</p>
                <p className="text-3xl md:text-4xl font-bold text-orange-600">{stats.progress}%</p>
              </div>
              <ChartBarIcon className="w-14 h-14 text-orange-400 opacity-50" />
            </div>
          </div>
        </div>

        {/* Main Features Section */}
        <div className="mb-12 md:mb-16 lg:mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 md:mb-10">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            <Card
              title="Profile Management"
              description="Update your profile, skills, and interests"
              icon={<UserIcon className="w-8 h-8" />}
              link="/dashboard/userdashboard/profile"
            />
            <Card
              title="Discover Coaches"
              description="Find the perfect mentor for your goals"
              icon={<MagnifyingGlassIcon className="w-8 h-8" />}
              link="/dashboard/userdashboard/coachdiscovery"
            />
            {/* <Card 
              title="Book a Session" 
              description="Schedule your next coaching session"
              icon={<CalendarIcon className="w-8 h-8" />} 
              link="/dashboard/userdashboard/booksession" 
            /> */}
            {/* <Card 
              title="AI Mentor Chat" 
              description="Get instant answers from AI assistant"
              icon={<ChatBubbleLeftRightIcon className="w-8 h-8" />} 
              link="/dashboard/userdashboard/userAi" 
            /> */}
            {/* <Card 
              title="Session Feedback" 
              description="Review and rate your completed sessions"
              icon={<CheckCircleIcon className="w-8 h-8" />} 
              link="/dashboard/userdashboard/sessionfeedback" 
            /> */}
            {/* <Card 
              title="Payment History" 
              description="Manage payments and billing"
              icon={<CreditCardIcon className="w-8 h-8" />} 
              link="/dashboard/userdashboard/userpayment" 
            /> */}
            <Card
              title="Sessions"
              description="Manage Your Upcoming and History"
              icon={<UserIcon className="w-8 h-8" />}
              link="/dashboard/userdashboard/userschedule"
            />
          </div>
        </div>

        {/* Recent Activity */}
        {/* <div className="card">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircleIcon className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Session completed with John Doe</p>
                  <p className="text-sm text-gray-500">Career Coaching - 2 hours ago</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <CalendarIcon className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Upcoming session booked</p>
                  <p className="text-sm text-gray-500">Fitness Coaching - Tomorrow at 10:00 AM</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">New message from AI Mentor</p>
                  <p className="text-sm text-gray-500">Personalized recommendations available</p>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </main>

      <Footer />
    </div>
  );
}
