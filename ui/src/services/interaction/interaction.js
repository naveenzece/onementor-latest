import { API_URL } from "../apiendpoints";

/**
 * Send a message to the AI
 * @param {string} message - The user's message
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} The AI's response
 */
export async function askAI(message, userId) {
    try {
        const res = await fetch(`${API_URL}interact/ask`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, userId }),
        });

        const data = await res.json();
        if (!res.ok) {
            return { error: data.error || "Failed to get AI response" };
        }
        return data;
    } catch (err) {
        console.error("askAI error", err);
        return { error: "Network error" };
    }
}

/**
 * Get AI interaction history for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} List of interaction history
 */
export async function getAIHistory(userId) {
    try {
        const res = await fetch(`${API_URL}interact/history/${userId}`, {
            method: "GET",
        });

        const data = await res.json();
        if (!res.ok) {
            return { error: data.error || "Failed to fetch history" };
        }
        return data;
    } catch (err) {
        console.error("getAIHistory error", err);
        return { error: "Network error" };
    }
}
