import { API_URL } from "./apiendpoints";

export const saveVPA = async (payload) => {
  // Read auth token from common localStorage keys used across the app
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    "";

  const url = `${API_URL}mentor/profile/vpa`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to save VPA");
  }

  return res.json();
};
