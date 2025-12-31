"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EarningsTable from "@/components/coach/earnings/EarningsTable";
import axios from "axios";
import { toastrError } from "@/components/ui/toaster/toaster";
import Loader from "@/components/ui/loader/loader";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { API_URL, APIENDPOINTS } from "@/services/apiendpoints";

const EarningsPage = () => {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    totalEarnings: 0,
    paidEarnings: 0,
    pendingEarnings: 0,
    totalSessions: 0
  });

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toastrError("User not authenticated");
        router.push("/login");
        return;
      }

      setLoading(true);
      // Fetch both confirmed and completed bookings
      const response = await axios.get(`${API_URL}/api/mentor/requests/${userId}?status=confirmed,completed`);

      const data = response.data || [];
      setSessions(data);

      // Calculate totals
      const stats = data.reduce((acc, session) => {
        const amount = parseFloat(session.amount || 0);
        acc.totalEarnings += amount;
        acc.totalSessions += 1;

        if (session.payment_status?.toLowerCase() === 'paid') {
          acc.paidEarnings += amount;
        } else {
          acc.pendingEarnings += amount;
        }

        return acc;
      }, { totalEarnings: 0, paidEarnings: 0, pendingEarnings: 0, totalSessions: 0 });

      setTotals(stats);
    } catch (error) {
      console.error("Error fetching earnings:", error);
      toastrError("Failed to load earnings data");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <Header />
      <main className="flex-grow w-full py-12 md:py-16 fade-in px-4 md:px-8 lg:px-12">
        <Loader isLoading={loading} message="Loading your earnings..." />

        <div className="w-full max-w-[1600px] mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <button
                onClick={handleBack}
                className="group flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-2"
              >
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-sm font-medium">Back to Dashboard</span>
              </button>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Earnings Dashboard</h1>
              <p className="text-gray-500 text-sm mt-1">Monitor and manage your session revenue</p>
            </div>

            <button
              onClick={fetchEarnings}
              className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Total Revenue</p>
              <h3 className="text-3xl font-bold text-gray-900">₹{totals.totalEarnings.toLocaleString('en-IN')}</h3>
              <div className="mt-3 inline-flex items-center text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase tracking-wider">
                Gross Earnings
              </div>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Received</p>
              <h3 className="text-3xl font-bold text-emerald-600">₹{totals.paidEarnings.toLocaleString('en-IN')}</h3>
              <div className="mt-3 inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase tracking-wider">
                Payment Confirmed
              </div>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Pending</p>
              <h3 className="text-3xl font-bold text-amber-600">₹{totals.pendingEarnings.toLocaleString('en-IN')}</h3>
              <div className="mt-3 inline-flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded uppercase tracking-wider">
                Awaiting Payment
              </div>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Total Sessions</p>
              <h3 className="text-3xl font-bold text-gray-900">{totals.totalSessions}</h3>
              <div className="mt-3 inline-flex items-center text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded uppercase tracking-wider">
                Confirmed/Completed
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Recent Transactions</h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Live Data</span>
              </div>
            </div>

            <div className="p-0">
              <EarningsTable sessions={sessions} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EarningsPage;
