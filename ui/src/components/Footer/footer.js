"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white mt-auto text-sm">
            <div className="container-professional !py-2 md:!py-4">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-14 mb-10">

                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/50 shadow-md">
                                <Image
                                    src="/images/onementor.jpg"
                                    alt="OneMentor Logo"
                                    width={48}
                                    height={48}
                                    className="object-cover"
                                />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">OneMentor</span>
                        </div>
                        <p className="text-gray-300 text-base max-w-sm leading-relaxed mb-6">
                            Empowering individuals through personalized mentorship.
                            Connect with expert coaches and unlock your full potential.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-lg mb-5 text-white">Quick Links</h4>
                        <ul className="space-y-3">
                            <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors text-base">About Us</Link></li>
                            <li><Link href="/features" className="text-gray-300 hover:text-white transition-colors text-base">Features</Link></li>
                            <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-base">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold text-lg mb-5 text-white">Support</h4>
                        <ul className="space-y-3">
                            {/* <li><Link href="/help" className="text-gray-300 hover:text-white transition-colors text-base">Help Center</Link></li> */}
                            <li><Link href="/terms" className="text-gray-300 hover:text-white transition-colors text-base">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="text-gray-300 hover:text-white transition-colors text-base">Privacy Policy</Link></li>
                            <li><Link href="/faq" className="text-gray-300 hover:text-white transition-colors text-base">FAQ</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 mt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                        <p>
                            © {currentYear} OneMentor. All rights reserved.
                        </p>
                        <div className="flex space-x-8">
                            <Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
                            <Link href="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
                            <Link href="/cookies" className="hover:text-white transition-colors">Cookie Settings</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
