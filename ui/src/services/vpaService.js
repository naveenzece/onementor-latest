const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001";

export const saveVPA = async (payload) => {
  // Read auth token from common localStorage keys used across the app
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    "";

  const url = `${API_BASE.replace(/\/+$/, '')}/api/mentor/profile/vpa`;

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
