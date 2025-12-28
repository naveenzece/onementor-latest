"use client";
import { useState } from "react";

import { addProgress } from "@/services/progress/progress";

export default function ProgressUpdate({ userId, bookingId }) {
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const res = await addProgress({ userId, bookingId, progressNotes: notes });
    if (!res.error) {
      setSaved(true);
    }
  };

  if (saved) return <p className="text-green-600">Progress updated!</p>;

  return (
    <div className="border p-4 rounded-xl shadow-md mt-4">
      <h2 className="text-lg font-bold mb-2">Update Progress</h2>
      <textarea
        className="w-full border p-2 mb-2 rounded"
        placeholder="Add learning notes..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save Progress
      </button>
    </div>
  );
}
