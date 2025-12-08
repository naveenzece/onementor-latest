"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CoachCard from "@/components/userdiscovery/CoachCard";
import FilterBar from "@/components/userdiscovery/FilterBar";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { ArrowLeftIcon, MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { discoverMentors } from "@/services/discovery/discovery";

const CoachesPage = () => {
  const [coaches, setCoaches] = useState([]);
  const [filters, setFilters] = useState({ expertise: "", skill: "", date: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(true);

  const router = useRouter();

  const fetchCoaches = async () => {
    setLoading(true);
    setError(null);

    try {
      // Map filter names to API filter names
      const apiFilters = {
        category: filters.expertise || undefined,
        skill: filters.skill || undefined,
        date: filters.date || undefined
      };

      // Remove undefined values
      Object.keys(apiFilters).forEach(key => {
        if (apiFilters[key] === undefined || apiFilters[key] === '') {
          delete apiFilters[key];
        }
      });

      const response = await discoverMentors(apiFilters);

      if (response.error) {
        setError(response.error);
        setCoaches([]);
        return;
      }

      // Transform API response to match component expectations
      const transformedData = (response || []).map(mentor => {
        // Handle skills - can be JSON string, array, or null
        let skillsText = '';
        if (mentor.skills) {
          try {
            const skillsArray = typeof mentor.skills === 'string' 
              ? JSON.parse(mentor.skills) 
              : mentor.skills;
            skillsText = Array.isArray(skillsArray) 
              ? skillsArray.join(', ') 
              : (typeof mentor.skills === 'string' ? mentor.skills : '');
          } catch (e) {
            skillsText = typeof mentor.skills === 'string' ? mentor.skills : '';
          }
        }

        return {
          id: mentor.user_id,
          name: mentor.name || mentor.username || 'Unknown',
          expertise: mentor.category || 'Not specified',
          skills: skillsText,
          rating: mentor.rating || 0,
          sessions_completed: mentor.total_sessions || 0,
          price: mentor.hourly_rate ? `₹${parseFloat(mentor.hourly_rate).toLocaleString('en-IN')}` : '₹0',
          bio: mentor.bio || '',
          available_slots: mentor.available_slots_count || 0
        };
      });

      // Remove duplicates based on id
      const uniqueCoaches = Array.from(
        new Map(transformedData.map(coach => [coach.id, coach])).values()
      );

      setCoaches(uniqueCoaches);
    } catch (err) {
      console.error("Error fetching coaches:", err);
      setError("Failed to fetch coaches. Please try again.");
      setCoaches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoaches();
  }, []);

  // Refetch when filters change (optional - can be removed if you want manual search only)
  // useEffect(() => {
  //   fetchCoaches();
  // }, [filters]);

  const handleSearch = () => {
    fetchCoaches();
  };

  const clearFilters = () => {
    setFilters({ expertise: "", skill: "", date: "" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow container-professional py-8 md:py-10 lg:py-12 fade-in">
        {/* Header Section */}
        <div className="mb-10 md:mb-12">
          <button
            onClick={() => router.push("/dashboard/user")}
            className="flex items-center text-gray-600 hover:text-[var(--primary)] mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">
                Discover Expert Coaches
              </h1>
              <p className="text-gray-600 text-lg">
                Find the perfect mentor to guide your journey
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary px-6 py-2.5 flex items-center space-x-2"
            >
              <FunnelIcon className="w-5 h-5" />
              <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
          <div className="card p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <p className="text-sm text-gray-600 font-medium">Available Coaches</p>
            <p className="text-2xl font-bold text-[var(--primary)] mt-1">{coaches.length}</p>
          </div>
          <div className="card p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <p className="text-sm text-gray-600 font-medium">Specializations</p>
            <p className="text-2xl font-bold text-green-600 mt-1">12+</p>
          </div>
          <div className="card p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <p className="text-sm text-gray-600 font-medium">Average Rating</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">4.8 ★</p>
          </div>
        </div>

        {/* Filter Bar */}
        {showFilters && (
          <div className="card p-6 mb-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <MagnifyingGlassIcon className="w-6 h-6 mr-2 text-[var(--primary)]" />
                Search Filters
              </h2>
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-[var(--primary)] underline"
              >
                Clear All
              </button>
            </div>
            <FilterBar filters={filters} setFilters={setFilters} handleSearch={handleSearch} />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="spinner mb-4"></div>
            <p className="text-gray-600">Finding the best coaches for you...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card p-4 bg-yellow-50 border-yellow-200 mb-6">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="font-semibold text-yellow-900">Demo Mode</p>
                <p className="text-sm text-yellow-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Coaches Grid */}
        {!loading && (
          <>
            {coaches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {coaches.map(coach => <CoachCard key={coach.id} coach={coach} />)}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Coaches Found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters to find more coaches</p>
                <button
                  onClick={clearFilters}
                  className="btn btn-primary px-6 py-2"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CoachesPage;
