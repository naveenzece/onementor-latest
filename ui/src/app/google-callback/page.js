"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "@/components/ui/loader/loader";
import { toastrError, toastrSuccess } from "@/components/ui/toaster/toaster";

export default function GoogleCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const error = searchParams.get("error");
        const token = searchParams.get("token");
        const userId = searchParams.get("userId");
        const role = searchParams.get("role");
        const email = searchParams.get("email");
        const name = searchParams.get("name");
        const calendarConnected = searchParams.get("calendar_connected");

        if (error) {
            toastrError(decodeURIComponent(error));
            setTimeout(() => router.push("/login"), 2000);
            return;
        }

        if (token && userId && role) {
            // Store in localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("userId", userId);
            localStorage.setItem("userRole", role);
            if (email) localStorage.setItem("userEmail", email);
            if (name) localStorage.setItem("userName", name);

            toastrSuccess("Login successful!");

            if (calendarConnected === 'true') {
                toastrSuccess("Google Calendar connected successfully!");
            }

            // Redirect to dashboard
            const dashboardPath = role === "mentor" ? "/dashboard/coach" : "/dashboard/user";
            router.push(dashboardPath);
        } else {
            toastrError("Authentication failed. Missing data.");
            setTimeout(() => router.push("/login"), 2000);
        }
    }, [router, searchParams]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader isLoading={true} message="Processing Google Login..." />
        </div>
    );
}
