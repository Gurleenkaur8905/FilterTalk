"use client";

import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";  // Import Socket type from socket.io-client
import SocketContext from "../context/SocketContext"; // Import SocketContext

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);  // State to hold the socket instance with type definition

  useEffect(() => {
    const userId = localStorage.getItem('userId');  // Fetch userId only once during component mount
    
    // Create the socket connection
    const socketInstance = io();  // Automatically connect to the same origin (http://localhost:3000)
    
    socketInstance.on("connect", () => {
      console.log("Client connected to the server!");

      // Emit userId after the connection is established
      if (userId) {
        socketInstance.emit('user-id', { userId });
      }
    });

    // Set socket instance in state
    setSocket(socketInstance);

    // Cleanup socket on unmount
    return () => {
      socketInstance.disconnect();
      console.log("Socket disconnected.");
    };
  }, []);  // Empty dependency array ensures this runs only once during the initial mount

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
