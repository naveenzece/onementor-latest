'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toastrSuccess, toastrError } from '../../../../components/ui/toaster/toaster';
import Loader from '../../../../components/ui/loader/loader';

import { logout } from "@/services/auth/auth";

export default function LogoutButton() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    setShowModal(false);
    try {
      await logout();

      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');

      // Redirect to login - keep loader visible during redirect
      router.push('/login');
      // Don't set loading to false - keep it visible during redirect
    } catch (err) {
      console.error('Network or fetch error:', err);
      // Redirect to login even on error - keep loader visible during redirect
      localStorage.clear();
      router.push('/login');
      // Don't set loading to false - keep it visible during redirect
    }
  };

  return (
    <>
      <Loader isLoading={loading} message="Logging out..." />
      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={() => setShowModal(true)}
          className="
            px-6 py-3
            font-semibold text-white
            bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500
            rounded-2xl
            shadow-lg
            transition-transform transform hover:scale-105 hover:shadow-2xl
            active:scale-95
            focus:outline-none focus:ring-4 focus:ring-pink-300
          "
        >
          Logout
        </button>

        {/* ✅ Back Button below Logout */}
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-800 text-white rounded-2xl shadow hover:bg-gray-900 transition"
        >
          ← Back
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-80 text-center">
            <h2 className="text-lg font-bold mb-4">Confirm Logout</h2>
            <p className="mb-6">Are you sure you want to logout?</p>
            <div className="flex justify-around">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
