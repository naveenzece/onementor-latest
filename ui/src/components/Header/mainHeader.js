"use client";

import Link from "next/link";
import Image from "next/image";

export default function MainHeader() {
    return (
        <header className="sticky top-0 z-50 glass-effect border-b border-gray-200 shadow-md">
            <div className="container-professional !py-0">
                <div className="flex items-center justify-between py-2 md:py-3">

                    {/* Logo Only */}
                    <Link href="/" className="group flex items-center gap-2">
                        <div className="w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden border-2 border-white/50 shadow-md transition-transform duration-300 group-hover:scale-105">
                            <Image
                                src="/images/onementor.jpg"
                                alt="OneMentor Logo"
                                width={44}
                                height={44}
                                className="object-cover"
                                priority
                            />
                        </div>
                        <span className="font-bold text-xl text-[var(--primary)] tracking-tight hidden sm:block">OneMentor</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
                        <Link
                            href="/about"
                            className="text-gray-600 hover:text-[var(--primary)] font-medium transition-colors duration-200 text-sm lg:text-base"
                        >
                            About
                        </Link>
                        <Link
                            href="/features"
                            className="text-gray-600 hover:text-[var(--primary)] font-medium transition-colors duration-200 text-sm lg:text-base"
                        >
                            Features
                        </Link>
                        {/* <Link
                            href="/pricing"
                            className="text-gray-600 hover:text-[var(--primary)] font-medium transition-colors duration-200 text-sm lg:text-base"
                        >
                            Pricing
                        </Link> */}
                    </nav>

                    {/* CTA Buttons */}
                    <div className="flex items-center space-x-3 md:space-x-4">
                        <Link
                            href="/login"
                            className="hidden sm:inline-flex px-4 py-2 text-[var(--primary)] font-semibold text-sm hover:bg-gray-50 rounded-lg transition-all duration-200"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/signup"
                            className="btn btn-primary px-5 py-2 !text-sm !rounded-full font-semibold shadow-md hover:shadow-lg"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
