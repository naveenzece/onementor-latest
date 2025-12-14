"use client";

import Image from "next/image";

/**
 * Reusable Loader Component
 * @param {boolean} isLoading - Whether to show the loader
 * @param {string} message - Optional loading message (default: "Loading...")
 */
export default function Loader({ isLoading, message = "Loading..." }) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-[2px]">
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="spinner" style={{ width: '120px', height: '120px', borderWidth: '4px' }}></div>
          </div>
          <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white shadow-2xl">
            <Image
              src="/images/onementor.jpg"
              alt="OneMentor"
              width={112}
              height={112}
              className="object-cover w-full h-full"
              priority
            />
          </div>
        </div>
        <p className="text-[var(--primary)] text-lg md:text-xl font-semibold animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}

