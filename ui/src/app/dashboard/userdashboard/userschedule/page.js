"use client";
import { useState, useEffect } from "react";
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { getUserUpcomingSessions, getUserSessionHistory } from "@/services/booking/booking";

const UserSchedule = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [historySessions, setHistorySessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserSessions();
  }, []);



  const fetchUserSessions = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");

      if (!userId) {
        setError("User not found");
        setLoading(false);
        return;
      }

      const [upcomingData, historyData] = await Promise.all([
        getUserUpcomingSessions(userId),
        getUserSessionHistory(userId)
      ]);

      if (upcomingData && !upcomingData.error) {
        setUpcomingSessions(filterUpcoming(upcomingData.sessions || []));
      }

      if (historyData && !historyData.error) {
        setHistorySessions(historyData.sessions || []);
      }
    } catch (err) {
      setError("Failed to load sessions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     HELPERS (IMPORTANT)
  ======================= */

  // Prevent timezone shift
  const formatDate = (dateString) => {
    const [y, m, d] = dateString.split("-");
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const formatTime = (timeString) => {
    const [h, m] = timeString.split(":");
    const date = new Date();
    date.setHours(h, m, 0, 0);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  // Extra safety filter
  const filterUpcoming = (sessions) => {
    const now = new Date();
    return sessions.filter((s) => {
      const [y, m, d] = s.date.split("-");
      const [hh, mm] = s.startTime.split(":");
      const sessionDate = new Date(y, m - 1, d, hh, mm);
      return sessionDate > now;
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      case "confirmed":
      case "booked":
      case "scheduled":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  /* =======================
     SESSION CARD
  ======================= */

  const SessionCard = ({ session, isHistory = false }) => (
    <div className="bg-white rounded-lg shadow-md border p-6">
      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold">{session.coachName}</h3>
            <p className="text-sm text-gray-600">{session.sessionType}</p>
          </div>
        </div>
        {isHistory && (
          <span className={`px-3 py-5 rounded-full text-xs ${getStatusColor(session.status)}`}>
            {session.status}
          </span>
        )}
      </div>

      <div className="space-y-2 text-gray-600">
        <div className="flex items-center">
          <CalendarIcon className="w-5 h-5 mr-2" />
          {formatDate(session.date)}
        </div>
        <div className="flex items-center">
          <ClockIcon className="w-5 h-5 mr-2" />
          {formatTime(session.startTime)} – {formatTime(session.endTime)}
        </div>
        {session.amount && <p>Amount: ₹{session.amount}</p>}
      </div>

      {!isHistory && session.paymentStatus === "completed" && (
        <div className="flex gap-3 mt-4">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
            <VideoCameraIcon className="w-4 h-4 mr-2" />
            Join Session
          </button>
          <button className="flex items-center px-4 py-2 border rounded-lg">
            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
            Message
          </button>
        </div>
      )}
    </div>
  );

  /* =======================
     RENDER
  ======================= */

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-6">My Schedule</h1>

        <div className="flex mb-6 bg-white border rounded-lg">
          <button
            className={`flex-1 py-3 ${activeTab === "upcoming" && "border-b-2 border-blue-600 text-blue-600"}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming ({upcomingSessions.length})
          </button>
          <button
            className={`flex-1 py-3 ${activeTab === "history" && "border-b-2 border-blue-600 text-blue-600"}`}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <>
            {activeTab === "upcoming" && (
              upcomingSessions.length === 0 ? (
                <p className="text-center">No upcoming sessions</p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingSessions.map((s) => (
                    <SessionCard key={s.id} session={s} />
                  ))}
                </div>
              )
            )}

            {activeTab === "history" && (
              historySessions.length === 0 ? (
                <p className="text-center">No session history</p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {historySessions.map((s) => (
                    <SessionCard key={s.id} session={s} isHistory />
                  ))}
                </div>
              )
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default UserSchedule;
