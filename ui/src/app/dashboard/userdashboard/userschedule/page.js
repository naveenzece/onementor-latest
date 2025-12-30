"use client";

import { useState, useEffect } from "react";
import {
  CalendarIcon,
  ClockIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { getUserUpcomingSessions, getUserSessionHistory } from "@/services/booking/booking";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/loader/loader";

const UserSchedule = () => {
  const router = useRouter();
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
        setError("User session expired. Please log in again.");
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
      setError("Unable to load your schedule. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [y, m, d] = dateString.split("-");
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [h, m] = timeString.split(":");
    const date = new Date();
    date.setHours(h, m, 0, 0);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const filterUpcoming = (sessions) => {
    const now = new Date();
    return sessions.filter((s) => {
      const [y, m, d] = s.date.split("-");
      const [hh, mm] = s.startTime.split(":");
      const sessionDate = new Date(y, m - 1, d, hh, mm);
      return sessionDate > now;
    });
  };

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "confirmed":
      case "booked":
      case "scheduled":
        return "bg-sky-50 text-sky-700 border-sky-100";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const SessionCard = ({ session, isHistory = false }) => (
    <div className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-lg border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shrink-0">
            {getInitials(session.coachName)}
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border tracking-widest whitespace-nowrap ${getStatusStyles(session.status)}`}>
            {session.status}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2 break-words">{session.coachName}</h3>
          <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-500 border border-gray-200/50 leading-relaxed">
            {session.sessionType}
          </span>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-sm font-medium">{formatDate(session.date)}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
              <ClockIcon className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-sm font-medium">
              {formatTime(session.startTime)} – {formatTime(session.endTime)}
            </span>
          </div>
          {session.description && (
            <div className="flex items-start gap-3 text-gray-500">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                <InformationCircleIcon className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-xs italic leading-relaxed line-clamp-3">{session.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50/50 flex items-center justify-between gap-3 border-t border-gray-100">
        {!isHistory ? (
          <>
            {session.meetingLink ? (
              <a
                href={session.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
              >
                <VideoCameraIcon className="w-4 h-4" />
                Join Session
              </a>
            ) : (
              <button disabled className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-400 rounded-xl text-xs font-bold cursor-not-allowed">
                <VideoCameraIcon className="w-4 h-4" />
                Link Pending
              </button>
            )}
          </>
        ) : (
          <>
            <button className="flex-1 text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1 transition-colors">
              Session Feedback <ChevronRightIcon className="w-3 h-3" />
            </button>
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors">
              Re-book
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfdfe]">
      <Header />
      <Loader isLoading={loading} message="Fetching your schedule..." />

      <main className="flex-grow w-full py-12 md:py-16 fade-in px-4 md:px-8 lg:px-12">
        <div className="max-w-[1600px] mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <button
                onClick={() => router.back()}
                className="group flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-all mb-3"
              >
                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Back</span>
              </button>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">My Schedule</h1>
              <p className="text-gray-500 text-sm mt-2">Manage your upcoming calls and session history</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex p-1 bg-gray-100/80 backdrop-blur-sm rounded-2xl border border-gray-200/50">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === "upcoming"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                Upcoming
                {upcomingSessions.length > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === "upcoming" ? "bg-indigo-50" : "bg-gray-200"
                    }`}>
                    {upcomingSessions.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === "history"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                History
              </button>
            </div>
          </div>

          {error ? (
            <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 flex flex-col items-center text-center">
              <XCircleIcon className="w-12 h-12 text-rose-500 mb-4" />
              <p className="text-rose-900 font-bold mb-2">Something went wrong</p>
              <p className="text-rose-600 text-sm mb-6">{error}</p>
              <button
                onClick={fetchUserSessions}
                className="px-6 py-3 bg-rose-600 text-white rounded-2xl text-sm font-bold hover:bg-rose-700 transition-colors"
              >
                Try Refreshing
              </button>
            </div>
          ) : (
            <div className="space-y-12">
              {activeTab === "upcoming" ? (
                upcomingSessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                      <CalendarIcon className="w-10 h-10 text-gray-200" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No upcoming sessions</h3>
                    <p className="text-gray-400 text-sm max-w-xs text-center mb-8">
                      You haven't booked any sessions yet. Browse our coaches to get started!
                    </p>
                    <button
                      onClick={() => router.push("/dashboard/userdashboard/coachdiscovery")}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                      Find a Coach
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                    {upcomingSessions.map((s) => (
                      <SessionCard key={s.id} session={s} />
                    ))}
                  </div>
                )
              ) : (
                historySessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                      <ClockIcon className="w-10 h-10 text-gray-200" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No session history</h3>
                    <p className="text-gray-400 text-sm max-w-xs text-center">
                      Your completed and past sessions will be archived here for your reference.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                    {historySessions.map((s) => (
                      <SessionCard key={s.id} session={s} isHistory />
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserSchedule;
