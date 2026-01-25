"use client";

import { useState, useEffect } from "react";
import { Users, UserCheck, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { getMentors, getMentees, getAllUsers } from "@/services/user/user";
import { adminAuth } from "@/utils/adminAuth";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("mentors"); // ✅ default mentors
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminData, setAdminData] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const router = useRouter();


  useEffect(() => {
    // Check if admin is authenticated
    if (!adminAuth.isAuthenticated()) {
      router.push('/admin');
      return;
    }
    
    // Get admin data
    const admin = adminAuth.getAdminData();
    setAdminData(admin);
    
    fetchData();
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Call logout API and clear local storage
      await adminAuth.logout();
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local storage and redirect
      adminAuth.logout();
      router.push('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("🚀 Fetching mentors and mentees data...");

      // Fetch mentors using existing endpoint
      const mentorResponse = await getMentors();
      console.log("👨‍🏫 Mentors response:", mentorResponse);

      if (mentorResponse.error) {
        console.log("❌ Error fetching mentors:", mentorResponse.error);
        setMentors([]);
      } else {
        const mentorsData = Array.isArray(mentorResponse) ? mentorResponse : mentorResponse.data || [];
        setMentors(mentorsData);
        console.log("✅ Mentors loaded:", mentorsData.length, "mentors");
        console.log("📊 Mentor data structure:", mentorsData[0]);
      }

      // Fetch mentees (now with mock data)
      const menteeResponse = await getMentees();
      console.log("👨‍🎓 Mentees response:", menteeResponse);

      if (menteeResponse.error) {
        console.log("❌ Error fetching mentees:", menteeResponse.error);
        setMentees([]);
      } else {
        const menteesData = Array.isArray(menteeResponse) ? menteeResponse : menteeResponse.data || [];
        setMentees(menteesData);
        console.log("✅ Mentees loaded:", menteesData.length, "mentees");
        console.log("📊 Mentee data structure:", menteesData[0]);
      }

      // Show message about any errors
      if (mentorResponse.error || menteeResponse.error) {
        setError("Some data could not be loaded. Check console for details.");
      }

    } catch (err) {
      console.error("💥 Error fetching data:", err);
      setError("Network error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-8">
      {/* Header */}
      <div className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Monitor mentors and mentees activity
            {adminData && (
              <span className="ml-2 text-blue-600">
                • Welcome, {adminData.name}
              </span>
            )}
          </p>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut size={18} />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>

      {/* API Status Info */}
      {/*{!loading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm font-medium">🔗 Dashboard Status</p>
          <p className="text-blue-700 text-sm mt-1">
            Connected to existing backend API. Displaying data from your database.
          </p>
          <div className="mt-2 text-xs text-blue-600">
            <p className="font-medium">Backend API Endpoints:</p>
            <ul className="mt-1 ml-4 list-disc">
              <li><code>GET http://localhost:8001/api/users/role/mentor</code> - Fetch all mentors</li>
              <li><code>GET http://localhost:8001/api/users/role/user</code> - Fetch all mentees</li>
            </ul>
          </div>
        </div>
      )}*/}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        {/* Mentors */}
        <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-sm text-blue-600 font-medium">Total Mentors</p>
            <h2 className="text-4xl font-bold text-slate-800 mt-2">
              {loading ? "..." : mentors.length}
            </h2>
          </div>
          <div className="p-4 bg-blue-200/60 rounded-xl text-blue-700">
            <UserCheck size={32} />
          </div>
        </div>

        {/* Mentees */}
        <div className="rounded-2xl p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-sm text-emerald-600 font-medium">Total Mentees</p>
            <h2 className="text-4xl font-bold text-slate-800 mt-2">
              {loading ? "..." : mentees.length}
            </h2>
          </div>
          <div className="p-4 bg-emerald-200/60 rounded-xl text-emerald-700">
            <Users size={32} />
          </div>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="bg-white rounded-2xl shadow-md border">
        {/* Tabs */}
        <div className="flex gap-3 p-4 border-b bg-slate-50 rounded-t-2xl">
          <button
            onClick={() => setActiveTab("mentors")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${activeTab === "mentors"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-600 hover:bg-slate-200"
              }`}
          >
            Mentors ({mentors.length})
          </button>

          <button
            onClick={() => setActiveTab("mentees")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${activeTab === "mentees"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-600 hover:bg-slate-200"
              }`}
          >
            Mentees ({mentees.length})
          </button>
        </div>

        {/* Table */}
        <div className="p-6 overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-slate-500">Loading users...</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-sm">
                  <th className="text-left px-4 py-3 rounded-l-lg">Name</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Phone</th>
                  <th className="text-left px-4 py-3 rounded-r-lg">Status</th>
                </tr>
              </thead>

              <tbody>
                {(activeTab === "mentors" ? mentors : mentees)?.length > 0 ? (
                  (activeTab === "mentors" ? mentors : mentees).map((user, index) => (
                    <tr
                      key={user.id ?? index}
                      className="border-b last:border-0 hover:bg-slate-50 transition"
                    >
                      <td className="px-4 py-4 font-medium text-slate-800">
                        {user.name ?? "N/A"}
                      </td>
                      <td className="px-4 py-4 text-slate-500">
                        {user.email ?? "N/A"}
                      </td>
                      <td className="px-4 py-4 text-slate-500">
                        {user.phone ?? "N/A"}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${Number(user.is_active) === 1
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                            }`}
                        >
                          {Number(user.is_active) === 1 ? "Active" : "Inactive"}
                        </span>

                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-slate-500">
                      No data available
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
