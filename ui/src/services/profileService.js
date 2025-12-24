const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001";

export const getMentorProfile = async (mentorId) => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    "";

  const url = `${API_BASE.replace(/\/+$/, '')}/api/mentor/profile/${mentorId}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to fetch mentor profile");
  }

  return res.json();
};

export const isVPAValid = (profile) => {
  return profile?.vpa_status === "valid" || profile?.vpa_status === "verified";
};
