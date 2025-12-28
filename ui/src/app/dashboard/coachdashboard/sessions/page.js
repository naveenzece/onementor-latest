"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { ArrowLeft, Calendar, Clock, User, ExternalLink } from "lucide-react";

import { getSlotsByMentor } from "@/services/mentor/mentor";

// ...

export default function AllSessionsPage() {
    const router = useRouter();
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUpcomingSessions();
    }, []);

    const fetchUpcomingSessions = async () => {
        try {
            const userId = localStorage.getItem("userId");
            if (!userId) {
                router.push("/login");
                return;
            }

            const data = await getSlotsByMentor(userId);

            if (data.error) throw new Error(data.error || "Failed to fetch sessions");

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
        } finally {
            setLoading(false);
        }
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

        return sessionDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
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

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading sessions...</p>
                    </div>
                </div>
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
                        onClick={() => router.back()}
                        className="flex items-center text-gray-600 hover:text-[var(--primary)] mb-4 transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to Dashboard</span>
                    </button>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <Calendar className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-800">
                            All Upcoming Sessions
                        </h1>
                    </div>
                    <p className="text-gray-600 text-lg">
                        View and manage all your scheduled coaching sessions
                    </p>
                </div>

                {/* Sessions Count */}
                <div className="mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                            {upcomingSessions.length} {upcomingSessions.length === 1 ? 'Session' : 'Sessions'} Scheduled
                        </span>
                    </div>
                </div>

                {/* Sessions List */}
                {upcomingSessions.length === 0 ? (
                    <div className="card text-center py-16">
                        <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Upcoming Sessions</h3>
                        <p className="text-gray-500 mb-6">You don't have any scheduled sessions at the moment.</p>
                        <button
                            onClick={() => router.push('/dashboard/coach')}
                            className="btn btn-primary px-6 py-3"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {upcomingSessions.map((session, index) => {
                            const colors = [
                                { bg: 'bg-blue-50', border: 'border-blue-200', avatar: 'bg-blue-600', accent: 'text-blue-600' },
                                { bg: 'bg-green-50', border: 'border-green-200', avatar: 'bg-green-600', accent: 'text-green-600' },
                                { bg: 'bg-purple-50', border: 'border-purple-200', avatar: 'bg-purple-600', accent: 'text-purple-600' },
                                { bg: 'bg-amber-50', border: 'border-amber-200', avatar: 'bg-amber-600', accent: 'text-amber-600' },
                                { bg: 'bg-pink-50', border: 'border-pink-200', avatar: 'bg-pink-600', accent: 'text-pink-600' },
                            ];
                            const color = colors[index % colors.length];

                            return (
                                <div
                                    key={session.id}
                                    className={`card ${color.bg} border-2 ${color.border} hover:shadow-lg transition-all duration-300`}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        {/* Left Section - User Info */}
                                        <div className="flex items-center gap-4">
                                            <div className={`w-16 h-16 rounded-full ${color.avatar} text-white flex items-center justify-center font-bold text-lg flex-shrink-0`}>
                                                {getInitials(session.user_name || session.booked_by_name || "User")}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                    {session.user_name || session.booked_by_name || "User"}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <User className="w-4 h-4" />
                                                    <span>Session #{session.id}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Middle Section - Date & Time */}
                                        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                                            <div className="flex items-center gap-2">
                                                <Calendar className={`w-5 h-5 ${color.accent}`} />
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                                                    <p className="font-semibold text-gray-900">
                                                        {formatSessionDate(session.date)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Clock className={`w-5 h-5 ${color.accent}`} />
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Time</p>
                                                    <p className="font-semibold text-gray-900">
                                                        {session.start_time} - {session.end_time}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Section - Status Badge & Meeting Link */}
                                        <div className="flex items-center gap-3">
                                            <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                                                <p className="text-sm font-semibold text-green-600">
                                                    Confirmed
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
                                                    Join Meeting
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
                )}
            </main>

            <Footer />
        </div>
    );
}
