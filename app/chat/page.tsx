"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import Layout from '@/components/Layout'

export default function ChatComponent() {
  const [messages, setMessages] = useState([
    { type: "received", content: "Hello! How are you today?" },
    { type: "sent", content: "I'm doing great, thanks for asking! How about you?" },
  ]);
  const [input, setInput] = useState("");

  const handleSendMessage = () => {
    if (input.trim() !== "") {
      setMessages([...messages, { type: "sent", content: input }]);
      setInput("");
    }
  };

  return (
    <Layout>
    <div className="flex h-screen bg-gray-50 text-gray-800">
        
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">Anonymous Chat</h1>
          <button className="border border-blue-300 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg">
            New Chat
          </button>
        </header>

        {/* Chat Area */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 bg-white shadow-lg rounded-lg">
            {/* Chat Messages */}
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg max-w-[80%] ${
                    message.type === "sent"
                      ? "bg-blue-100 ml-auto text-gray-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-50 text-gray-800 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                className="rounded-full bg-blue-500 hover:bg-blue-600 p-2"
                onClick={handleSendMessage}
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
}
