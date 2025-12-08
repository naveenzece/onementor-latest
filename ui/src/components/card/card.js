"use client";

import Link from "next/link";
import { LockClosedIcon } from "@heroicons/react/24/outline";

export default function Card({ title, icon, link, description, disabled = false, disabledMessage }) {
  const content = (
    <div className={`
      card h-full p-6 transition-all duration-300 group relative
      ${disabled 
        ? 'bg-gray-100 cursor-not-allowed opacity-60' 
        : 'bg-white hover:bg-gradient-to-br hover:from-[var(--primary)] hover:to-[var(--secondary)] cursor-pointer'
      }
    `}>
      {disabled && (
        <div className="absolute top-3 right-3">
          <LockClosedIcon className="w-5 h-5 text-gray-400" />
        </div>
      )}
      <div className="flex flex-col h-full">
        <div className={`
          flex items-center justify-center w-14 h-14 rounded-xl mb-4 transition-all duration-300
          ${disabled
            ? 'bg-gray-300'
            : 'bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] group-hover:bg-white'
          }
        `}>
          <div className={disabled ? 'text-gray-500' : 'text-white group-hover:text-[var(--primary)] transition-colors duration-300'}>
            {icon}
          </div>
        </div>
        <h3 className={`
          text-xl font-bold mb-2 transition-colors
          ${disabled ? 'text-gray-500' : 'text-gray-900 group-hover:text-white'}
        `}>
          {title}
        </h3>
        {description && (
          <p className={`
            text-sm transition-colors
            ${disabled ? 'text-gray-400' : 'text-gray-600 group-hover:text-gray-100'}
          `}>
            {description}
          </p>
        )}
        {disabled && disabledMessage && (
          <p className="text-xs text-amber-600 mt-2 font-medium">
            {disabledMessage}
          </p>
        )}
        <div className={`
          mt-auto pt-4 flex items-center font-medium
          ${disabled 
            ? 'text-gray-400' 
            : 'text-[var(--primary)] group-hover:text-white'
          }
        `}>
          <span className="text-sm">
            {disabled ? 'Locked' : 'Access now'}
          </span>
          {!disabled && (
            <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );

  if (disabled) {
    return content;
  }

  return link ? <Link href={link}>{content}</Link> : content;
}
