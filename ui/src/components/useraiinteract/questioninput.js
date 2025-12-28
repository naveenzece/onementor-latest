"use client";
import { useState } from "react";
import { toastrError } from "@/components/ui/toaster/toaster";

import { askAI } from "@/services/interaction/interaction";

export default function QuestionInput({ addMessage, userId }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      toastrError("Please enter a question");
      return;
    }

    if (!userId) {
      toastrError("User ID not found. Please login again.");
      return;
    }

    addMessage({ sender: "You", message: question });
    setLoading(true);

    try {
      const data = await askAI(question, userId);

      if (data.error) {
        toastrError(data.error);
        addMessage({ sender: "AI", message: "⚠️ Failed to get AI response. Please try again." });
      } else {
        addMessage({ sender: "AI", message: data.response || data.aiFeedback || "I'm here to help! Please try again." });
      }
    } catch (err) {
      console.error("AI interaction error:", err);
      toastrError("Failed to get AI response. Please check your connection.");
      addMessage({ sender: "AI", message: "⚠️ Failed to get AI response. Please try again." });
    } finally {
      setLoading(false);
      setQuestion("");
    }
  };

  return (
    <div className="flex gap-2 mt-2">
      <input
        className="flex-grow border rounded p-2"
        placeholder="Ask a question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        Send
      </button>
    </div>
  );
}
