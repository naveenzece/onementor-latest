import { API_URL } from "../apiendpoints";

// Submit feedback/report
export async function submitFeedback(feedbackData) {
    try {
        const res = await fetch(`${API_URL}reports`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(feedbackData)
        });
        const data = await res.json();
        if (!res.ok) {
            return { error: data.error || "Failed to submit feedback" };
        }
        return data;
    } catch (err) {
        console.error("submitFeedback error", err);
        return { error: "Network error" };
    }
}

// Get mentor feedback
export async function getMentorFeedback(mentorId) {
    try {
        const res = await fetch(`${API_URL}reports/mentor/${mentorId}`, {
            method: "GET",
        });
        const data = await res.json();
        if (!res.ok) {
            return { error: data.error || "Failed to fetch feedback" };
        }
        return data;
    } catch (err) {
        console.error("getMentorFeedback error", err);
        return { error: "Network error" };
    }
}

// Get booking feedback
export async function getBookingFeedback(bookingId) {
    try {
        const res = await fetch(`${API_URL}reports/booking/${bookingId}`, {
            method: "GET",
        });
        const data = await res.json();
        if (!res.ok) {
            return { error: data.error || "Failed to fetch feedback" };
        }
        return data;
    } catch (err) {
        console.error("getBookingFeedback error", err);
        return { error: "Network error" };
    }
}
