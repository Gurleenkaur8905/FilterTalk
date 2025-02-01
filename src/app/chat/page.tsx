"use client";

import { useEffect, useState, useContext } from "react";
import { FiSend } from "react-icons/fi";
import Layout from '@/components/Layout';
import { io } from "socket.io-client";
import SocketContext from "@/context/SocketContext";

export default function ChatComponent() {
  const { socket } = useContext(SocketContext) || { socket: null };
  const [messages, setMessages] = useState([
    { type: "received", content: "Hello! How are you today?" },
    { type: "sent", content: "I'm doing great, thanks for asking! How about you?" },
  ]);
  const [input, setInput] = useState("");
  const [roomId, setRoomId] = useState<string | null>(null);

  // Set up socket event listeners
  useEffect(() => {
    if(!socket)
    {
      console.log("no socket");
      return;
    }
    socket.on("connected", (data) => {
      console.log("message from server", data.message); // Log the "connected" message
    });
    // Listen for "chat-room-created" event
    socket.on("chat-room-created", (data) => {
      console.log("Chat room created:", data);
      setRoomId(data.roomId);
    });

     // Listen for messages from the server
     socket.on("receive-message", (data: { message: string }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "received", content: data.message },
      ]);
    });

     // Listen for peer disconnection or skip
     socket.on("chat-peer-disconnected", () => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "received", content: "Your chat partner left. Finding a new one..." },
      ]);
    });

    // Clean up event listeners on unmount
    return () => {
      socket.off("connected");
      socket.off("chat-room-created");
      socket.off("receive-message");
      socket.off("chat-peer-disconnected");
    };
  }, [roomId, socket]); // Re-run effect when roomId changes

  // Log roomId whenever it changes
  useEffect(() => {
    console.log("Room ID updated:", roomId);
  }, [roomId]);

  const handleSendMessage = () => {
    if(!socket)
    {
      console.log("not socket");
      return;
    }

    console.log("sent button pressed ");
    if (input.trim() !== "" && roomId) {
      console.log("sent button pressed  in if ");
      socket.emit("send-message", { message: input, roomId });
      console.log("Msg sent from frontedn", input);
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "sent", content: input },
      ]);
      setInput("");
      console.log("Message sent:", input); // Log message sent from frontend
    }
  };

  const handleSkip = () => {
    if(!socket)
    {
      console.error("no socket is there");
      return;
    }
    socket.emit("chat-skip");
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "received", content: "You skipped your current chat. Searching for a new one..." },
    ]);
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
            <button
              className="border border-blue-300 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg"
              onClick={handleSkip}
            >
              Skip
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
                  <FiSend className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}