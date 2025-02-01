// "use client";

// // WebRTCContext.tsx
// import React, { createContext, useContext, useRef, useState } from "react";
// import { io } from "socket.io-client";

// const WebRTCContext = createContext<any>(null);
// const socket = io("http://localhost:5000");

// export const WebRTCProvider = ({ children }: { children: React.ReactNode }) => {
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
//   const localVideoRef = useRef<HTMLVideoElement | null>(null);
//   const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
//   const peerConnections = useRef<{ [key: string]: RTCPeerConnection }>({});

//   const config = {
//     iceServers: [
//       {
//         urls: ["stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478"],
//       },
//     ],
//   };

//   // Function to start the local video stream
//   const startLocalVideo = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });
//       setLocalStream(stream);
//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = stream;
//       }
//       console.log("Local stream started");
//     } catch (error) {
//       console.error("Error accessing media devices:", error);
//     }
//   };

//   // Function to create and initialize a peer connection
//   const createPeerConnection = (receiverId: string) => {
//     const peerConnection = new RTCPeerConnection(config);
//     peerConnections.current[receiverId] = peerConnection;
//  // Add local tracks to PeerConnection
//     if (localStream) {
//       localStream.getTracks().forEach((track) => {
//         peerConnection.addTrack(track, localStream);
//       });
//     }
//  // Add local tracks to PeerConnection
//     peerConnection.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit("ice-candidate", { candidate: event.candidate, receiverId });
//       }
//     };
//  // Handle remote stream
//     peerConnection.ontrack = (event) => {
//       console.log("Received remote track:", event.streams[0]);
//       setRemoteStream(event.streams[0]);
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = event.streams[0];
//       }
//     };

//     return peerConnection;
//   };

//   // Function to create and send an offer
//   const createOffer = async (receiverId: string) => {
//     try {
//       const peerConnection = peerConnections.current[receiverId];
//       if (!peerConnection) {
//         console.error("PeerConnection does not exist for receiverId:", receiverId);
//         return;
//       }

//       const offer = await peerConnection.createOffer();
//       await peerConnection.setLocalDescription(offer);
//       socket.emit("offer", { offer, receiverId });
//       console.log("Offer sent");
//     } catch (error) {
//       console.error("Error creating offer:", error);
//     }
//   };

//   // Function to handle incoming offer
//   const handleOffer = async (offer: RTCSessionDescriptionInit, senderId: string) => {
//     const peerConnection = createPeerConnection(senderId);
//     await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
//     const answer = await peerConnection.createAnswer();
//     await peerConnection.setLocalDescription(answer);
//     socket.emit("answer", { answer, receiverId: senderId });
//     console.log("Answer sent");
//   };

//   // Function to handle incoming answer
//   const handleAnswer = async (answer: RTCSessionDescriptionInit, senderId: string) => {
//     const peerConnection = peerConnections.current[senderId];
//     if (!peerConnection) {
//       console.error("PeerConnection does not exist for senderId:", senderId);
//       return;
//     }
//     await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
//     console.log("Answer received and set");
//   };

//   // Function to handle incoming ICE candidate
//   const handleIceCandidate = async (candidate: RTCIceCandidateInit, senderId: string) => {
//     const peerConnection = peerConnections.current[senderId];
//     if (!peerConnection) {
//       console.error("PeerConnection does not exist for senderId:", senderId);
//       return;
//     }
//     await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//     console.log("ICE candidate added");
//   };

//   // Socket event listeners
//   socket.on("offer", ({ offer, senderId }) => handleOffer(offer, senderId));
//   socket.on("answer", ({ answer, senderId }) => handleAnswer(answer, senderId));
//   socket.on("ice-candidate", ({ candidate, senderId }) => handleIceCandidate(candidate, senderId));

//   return (
//     <WebRTCContext.Provider
//       value={{
//         localStream,
//         remoteStream,
//         localVideoRef,
//         remoteVideoRef,
//         startLocalVideo,
//         createPeerConnection,
//         createOffer,
//       }}
//     >
//       {children}
//     </WebRTCContext.Provider>
//   );
// };

// // Custom hook to use WebRTC context
// export const useWebRTC = () => {
//   const context = useContext(WebRTCContext);
//   if (!context) {
//     throw new Error("useWebRTC must be used within a WebRTCProvider");
//   }
//   return context;
// };
