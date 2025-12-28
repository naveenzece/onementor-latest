"use client";
import { useState, useEffect } from "react";
import QuestionInput from "./questioninput";

import { getAIHistory } from "@/services/interaction/interaction";

export default function ChatBox({ userId }) {
  const [messages, setMessages] = useState([]);

  const addMessage = (msg) => setMessages((prev) => [...prev, msg]);

  // Load chat history on mount
  useEffect(() => {
    if (userId) {
      const loadHistory = async () => {
        try {
          const history = await getAIHistory(userId);

          if (history && !history.error && Array.isArray(history) && history.length > 0) {
            const formattedMessages = history.reverse().flatMap(item => [
              { sender: "You", message: item.question },
              { sender: "AI", message: item.response || "No response available" }
            ]);
            setMessages(formattedMessages);
          }
        } catch (err) {
          console.error("Error loading chat history:", err);
        }
      };
      loadHistory();
    }
  }, [userId]);

  return (
    <div className="border rounded-xl p-4 w-full max-w-2xl mx-auto flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg">Start a conversation with AI</p>
            <p className="text-sm mt-2">Ask any question and get instant AI-powered responses</p>
          </div>
        ) : (
          messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === "You" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${m.sender === "You"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800"
                  }`}
              >
                <p className="text-xs font-semibold mb-1 opacity-80">{m.sender}</p>
                <p className="text-sm whitespace-pre-wrap">{m.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <QuestionInput addMessage={addMessage} userId={userId} />
    </div>
  );
}
