"use client";
import { useState } from "react";

import { submitFeedback } from "@/services/reports/reports";

export default function FeedbackForm({ bookingId, userId, coachId }) {
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    await submitFeedback({ bookingId, userId, coachId, rating, comments });
    setSubmitted(true);
  };

  if (submitted) return <p className="text-green-600">Feedback submitted!</p>;

  return (
    <div className="border p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-bold mb-2">Leave Feedback</h2>
      <label className="block mb-2">Rating:
        <select value={rating} onChange={(e) => setRating(e.target.value)} className="ml-2 border p-1">
          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <textarea
        className="w-full border p-2 mb-2 rounded"
        placeholder="Your comments..."
        value={comments}
        onChange={(e) => setComments(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </div>
  );
}
