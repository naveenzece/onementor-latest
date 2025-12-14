"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { User, LogOut, Mail, ChevronDown } from "lucide-react";
import { toastrSuccess, toastrError } from "@/components/ui/toaster/toaster";
import Loader from "@/components/ui/loader/loader";

export default function Header() {
    const [userEmail, setUserEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Get user info from localStorage
        const email = localStorage.getItem("userEmail") || "";
        const name = localStorage.getItem("userName") || "";
        setUserEmail(email);
        setUserName(name);
    }, []);

    const handleLogout = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8001/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });

            if (res.ok) {
                // Clear localStorage
                localStorage.removeItem("userId");
                localStorage.removeItem("userRole");
                localStorage.removeItem("userEmail");
                localStorage.removeItem("userName");
                localStorage.removeItem("token");

                toastrSuccess("Logged out successfully!");
                // Redirect to login - keep loader visible during redirect
                setTimeout(() => {
                    router.push("/login");
                }, 1000);
                // Don't set loading to false - keep it visible during redirect
            } else {
                toastrError("Logout failed. Please try again.");
                setLoading(false);
            }
        } catch (err) {
            console.error("Logout error:", err);
            // Clear localStorage even on error
            localStorage.clear();
            toastrError("Network error. Redirecting to login...");
            // Redirect to login - keep loader visible during redirect
            setTimeout(() => {
                router.push("/login");
            }, 1000);
            // Don't set loading to false - keep it visible during redirect
        }
    };

    return (
        <>
            <Loader isLoading={loading} message="Logging out..." />
            <header className="bg-gradient-to-r from-[#0A3551] via-[#0f4a70] to-[#0A3551] sticky top-0 shadow-xl w-full z-50 border-b border-[#1a5a7a]">
            <div className="container-professional px-2">
                <div className="flex flex-row justify-between items-center py-1">
                    
                    {/* ✅ Logo on Left */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden border-3 border-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl ring-2 ring-white/20">
                            <Image 
                                src="/images/onementor.jpg"
                                alt="OneMentor Logo"
                                width={64} 
                                height={64} 
                                className="object-cover w-full h-full"
                                priority
                            />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-white font-bold text-lg md:text-xl lg:text-2xl tracking-tight">
                                OneMentor
                            </h1>
                        </div>
                    </div>

                    {/* ✅ Profile Icon on Right - Square with Rounded Border */}
                    <div className="flex items-center">
                        <Menu as="div" className="relative inline-block text-left">
                            <div>
                                <MenuButton className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl bg-white/95 hover:bg-white border-2 border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0A3551] p-2.5">
                                    <User className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-[#0A3551]" />
                                </MenuButton>
                            </div>
                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-200"
                                enterFrom="opacity-0 scale-95 translate-y-1"
                                enterTo="opacity-100 scale-100 translate-y-0"
                                leave="transition ease-in duration-150"
                                leaveFrom="opacity-100 scale-100 translate-y-0"
                                leaveTo="opacity-0 scale-95 translate-y-1"
                            >
                                <MenuItems className=" absolute right-0 mt-3 w-72 origin-top-right divide-y divide-gray-100 rounded-2xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden border border-gray-100">
                                    {/* User Info Section */}
                                    <div className="p-4 bg-gradient-to-br from-[#0A3551] via-[#0f4a70] to-[#0A3551]">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center border-2 border-white/30">
                                                    <User className="w-6 h-6 text-white" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-white truncate">
                                                    {userName || "User"}
                                                </p>
                                                <div className="flex items-center space-x-1 mt-1">
                                                    <Mail className="w-3 h-3 text-white/80" />
                                                    <p className="text-xs text-white/80 truncate">
                                                        {userEmail || "No email"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="p-2">
                                        <MenuItem>
                                            {({ active }) => (
                                                <button
                                                    onClick={handleLogout}
                                                    className={`${
                                                        active ? 'bg-red-50 text-red-700' : 'text-gray-700'
                                                    } group flex w-full items-center rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                                                        active ? 'shadow-md' : ''
                                                    }`}
                                                >
                                                    <LogOut
                                                        className={`mr-3 h-5 w-5 ${
                                                            active ? 'text-red-600' : 'text-red-500'
                                                        } transition-transform duration-200 ${active ? 'transform -translate-x-1' : ''}`}
                                                    />
                                                    Logout
                                                    {active && (
                                                        <ChevronDown className="ml-auto h-4 w-4 text-red-600 rotate-90 transition-transform duration-200" />
                                                    )}
                                                </button>
                                            )}
                                        </MenuItem>
                                    </div>
                                </MenuItems>
                            </Transition>
                        </Menu>
                    </div>

                </div>
            </div>
        </header>
        </>
    );
}
