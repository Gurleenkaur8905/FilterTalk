"use client";
import { useEffect, useRef, useState, useContext } from "react";
import { FaMicrophone as Mic, FaCommentAlt as MessageSquare, FaUsers as Users, FaMagic as Wand2, FaUser as User, FaGhost as Ghost, FaCat as Cat, FaDog as Dog, FaBolt as Zap, FaVolumeMute as VolumeX, FaVolumeUp as Volume2, FaVolumeDown as Volume1} from "react-icons/fa";
import {FiSend, FiSmile} from "react-icons/fi"
import { LuSkipForward  } from "react-icons/lu";
import { GiPartyHat,GiBeard } from "react-icons/gi";
import { BsSunglasses } from "react-icons/bs";
import { CiPlay1 as Play } from "react-icons/ci";
import Layout from "@/components/Layout";
import { useSearchParams } from "next/navigation";
import { io } from "socket.io-client"
import SocketContext from "@/context/SocketContext";
import { startWebcamAndDetect } from '@/helper/faceFilterHelper';


// Connect to Socket.IO backend

export default function Component() {
  const { socket } = useContext(SocketContext) || { socket: null };
  const [activeTab, setActiveTab] = useState("video");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeVoice, setActiveVoice] = useState<string | null>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  const searchParams = useSearchParams();
  const username = searchParams.get("username");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null); // New state for remoteSocketId
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const iceCandidatesQueue = useRef<RTCIceCandidateInit[]>([]);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const RemoteFilteredRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  // const [isCompactLayout, setIsCompactLayout] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // Create a ref for the canvas
  const [isStreamReady, setIsStreamReady] = useState(false); // Track stream readiness
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const dataChannel = useRef<RTCDataChannel | null>(null); 
  const [filteredStream, setFilteredStream] = useState<MediaStream | null>(null);


  const filters = [
    { name: "None", icon: User },
    { name: "Beard", icon:  () => <img src="/Images/beard.png" alt="eyes" className="h-8 w-8" />},
    { name: "Hat", icon:  () => <img src="/Images/hat.png" alt="eyes" className="h-8 w-8" /> },
    { name: "Scarf", icon:  () => <img src="/Images/neck.png" alt="eyes" className="h-8 w-8" />  },
    { name: "Eyes",  icon: () => <img src="/Images/eye1.png" alt="eyes" className="h-8 w-8" /> },
    { name: "Sunglasses", icon: () => <img src="/Images/sunglasses.png" alt="Sunglasses" className="h-8 w-8" /> },
  ];

  const voices = [
    { name: "Normal", icon: Mic },
    { name: "Robot", icon: Wand2 },
    { name: "Helium", icon: Volume1 },
    { name: "Deep", icon: Volume2 },
    { name: "Muted", icon: VolumeX },
  ];

  const config = {
    iceServers: [
      {
        urls: ['stun:stun.l.google.com:19302', 'stun:global.stun.twilio.com:3478'],
      },
    ],
  };
  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("Local Stream Initialized:", stream);
      setLocalStream(stream);
      setIsStreamReady(true); // Mark the stream as ready
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  useEffect(() => {

    startLocalStream();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);




  useEffect(() => {
    let detectionInterval: NodeJS.Timeout | null = null;

    const initializeFaceDetection = async () => {
      try {
        console.log("Initializing face detection...");

        // faceLandmarker = await loadFaceDetectionModel();

        if (!localVideoRef.current || !canvasRef.current || !localVideoRef.current.srcObject) {
          console.warn("Refs or video stream not initialized.");
          return;
        }
        console.log("active filter -------", activeFilter);
        if (activeFilter) {
          console.log(`Applying face filter: ${activeFilter}`);
          const canvasStream = await startWebcamAndDetect(
            localVideoRef.current,
            canvasRef.current,
            activeFilter
          );
          // Check if we got the stream and assign it to the remote filtered video element
          if (canvasStream) {
            setFilteredStream(canvasStream); // Store filtered stream
            if (RemoteFilteredRef.current) {
              RemoteFilteredRef.current.srcObject = canvasStream; // Display locally
            }
            console.log("Filtered video stream assigned to RemoteFilteredRef.");
          } else {
            console.log("Error: Filtered video stream not created.");
          }
        } else {
          console.log("No filter selected. Clearing canvas...");
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) {
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
          }
        }
      } catch (error) {
        console.error("Error initializing face detection:", error);
      }
    };

    if (isStreamReady) {
      initializeFaceDetection();
    }

    return () => {
      console.log("Cleaning up face detection...");
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }

    };
  }, [activeFilter, isStreamReady]);



  // Initialize PeerConnection
  // Ensure localStream is ready before initializing PeerConnection
  const initializePeerConnection = async () => {
    if (!localStream) {
      console.log("Cannot initialize PeerConnection: No local stream available");
      startLocalStream();
      return;
    }

    // Cleanup existing peer connection
    if (peerConnection.current) {
      peerConnection.current.ontrack = null;
      peerConnection.current.onicecandidate = null;
      peerConnection.current.close();
      peerConnection.current = null;
    }

    // Create a new RTCPeerConnection
    peerConnection.current = new RTCPeerConnection(config);
    
  // 🔹 Create DataChannel for UI updates
  dataChannel.current = peerConnection.current.createDataChannel("ui-updates"); 
  dataChannel.current.onopen = () => console.log("✅ DataChannel Opened for UI Updates");
  dataChannel.current.onclose = () => console.log("❌ DataChannel Closed");

  // 🔹 Handle incoming DataChannel messages
  peerConnection.current.ondatachannel = (event) => {
    event.channel.onmessage = (e) => {
      const message = JSON.parse(e.data);
      
      if (message.type === "video-stopped") {
        console.log("📌 Remote user stopped video. Updating UI...");
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null; // Hide remote video
        }
      }

      if (message.type === "show-message") {
        console.log("📩 Message from peer:", message.text);
        // setChatMessage(message.text); // Update UI with received message
      }
    };
  };

    let streamToSend = filteredStream || localStream; // Use filteredStream if available, else fallback to localStream

    // Add local tracks to PeerConnection
    streamToSend.getTracks().forEach((track) => {
      peerConnection.current?.addTrack(track, localStream);
    });


    // Handle remote stream
    peerConnection.current.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStream(remoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    // Handle ICE candidates
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate && socket && remoteSocketId) {
        socket.emit("ice-candidate", { candidate: event.candidate, to: remoteSocketId });
      }
    };

    console.log("PeerConnection initialized");
  };


  useEffect(() => {
    if (!filteredStream || !peerConnection.current) return;

    console.log("Replacing video track with filtered stream...");

    const senders = peerConnection.current.getSenders();
    const videoSender = senders.find((sender) => sender.track?.kind === "video");

    if (videoSender) {
      const newVideoTrack = filteredStream.getVideoTracks()[0];
      videoSender.replaceTrack(newVideoTrack);
      console.log("Video track replaced successfully.");
    }
  }, [filteredStream]);

  // Socket events
  useEffect(() => {
    if (!socket) {
      console.log("no socket"); return;
    }

    // Listen for the "waiting-for-peer" event
    socket.on("waiting-for-peer", ({ roomId }) => {
      console.log(`Waiting for a peer in room: ${roomId}`);
      setIsWaiting(true); // Update waiting state
    });



    // Listen for "room-created" to stop waiting
    socket.on("room-created", ({ roomId, users }) => {
      console.log("Room ID:", roomId);
      console.log("Users in room:", users);
      setIsWaiting(false);

      const peer = users.find((user: any) => user.socketId !== socket.id);
      if (peer) {
        setRemoteSocketId(peer.socketId);
        setRemoteStream(null); // Reset remote stream
        console.log("Remote socket ID set to:", peer.socketId);
      } else {
        console.log("No peer found in room");
      }

      // Initialize the peer connection for the new user
      initializePeerConnection();
    });


    socket.on("offer", async ({ offer, from }: { offer: RTCSessionDescriptionInit; from: string }) => {
      setRemoteSocketId(from);
      initializePeerConnection();

      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        console.log("Remote description set for offer.");

        // Add any queued ICE candidates now
        while (iceCandidatesQueue.current.length > 0) {
          const candidate = iceCandidatesQueue.current.shift();
          try {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("Queued ICE candidate added successfully.");
          } catch (error) {
            console.error("Error adding queued ICE candidate:", error);
          }
        }

        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit("answer", { answer, to: from });
      }
    });

    socket.on("answer", async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (peerConnection.current) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("Error adding received ICE candidate:", error);
        }
      } else {
        console.log("Remote description not set yet, queuing ICE candidate.");
        iceCandidatesQueue.current.push(candidate);
      }
    });


    return () => {
      socket.off("waiting-for-peer");
      socket.off("room-created");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [socket]);
  // Add queued candidates when PeerConnection becomes ready
  useEffect(() => {
    if (peerConnection.current && iceCandidatesQueue.current.length > 0) {
      console.log("Adding queued ICE candidates...");
      iceCandidatesQueue.current.forEach(async (candidate) => {
        if (peerConnection.current) {
          try {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("Added queued ICE candidate");
          } catch (error) {
            console.error("Error adding queued ICE candidate:", error);
          }
        }
        else console.log("No peer connection");
      });
      iceCandidatesQueue.current = [];
    }
  }, [peerConnection.current]);


  // Create offer
  const createOffer = async () => {
    let retries = 5; // Retry 5 times before failing
    while (!remoteSocketId && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 500ms
      retries--;
    }
    if (!socket || !remoteSocketId) {
      console.error("Cannot create offer: No socket or remoteSocketId");
      return;
    }

    console.log("Creating offer...");
    initializePeerConnection();
    if (!peerConnection.current) {
      console.error("Cannot create offer: Missing PeerConnection ");
      return;
    }


    if (peerConnection.current) {
      try {
        const offer = await peerConnection.current.createOffer();
        console.log("Offer created:", offer);
        await peerConnection.current.setLocalDescription(offer);
        console.log("Local description set for offer.");
        socket.emit("offer", { offer, to: remoteSocketId });
        console.log("Offer sent to remote socket ID:", remoteSocketId);

      } catch (error) {
        console.error("Error creating offer:", error);
      }
    }
  };


  const handleSkip = () => {
    console.log("Skip button pressed");

    // Emit skip event to the backend
    if (socket) {
      socket.emit("skip");
    }

    // Cleanup local and remote streams
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);

    // Reset remoteSocketId as well
    setRemoteSocketId(null);

    // If there's a peer connection, close it
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    // Manually restart the local stream
    startLocalStream();
    // Re-initialize peer connection
    initializePeerConnection();

  };


  useEffect(() => {
    if (!socket) {
      console.log("No socket");
      return;
    }

    // Listen for skip event
    socket.on("skip", () => {
      console.log("Peer skipped. Cleaning up...");

      // Cleanup local and remote streams
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      setLocalStream(null);
      setRemoteStream(null);
      setRemoteSocketId(null);

      // Close the peer connection
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }

      // Re-initialize the peer connection for the next potential video call
      initializePeerConnection();
    });

    return () => {
      socket.off("skip");
    };
  }, [socket, localStream, peerConnection.current]);

  const stopVideo = () => {
    console.log("⛔ Stopping Local Video...");
  
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    navigator.mediaDevices.getUserMedia({ video: false }).then((stream) => {
      stream.getTracks().forEach((track) => track.stop());
    });
  
    if (peerConnection.current) {
      const senders = peerConnection.current.getSenders();
      senders.forEach((sender) => {
        if (sender.track?.kind === "video") {
          peerConnection.current?.removeTrack(sender);
        }
      });
      
      
      // 🔴 Notify peer using WebRTC DataChannel (No Backend Needed)
      if (dataChannel.current && dataChannel.current.readyState === "open") {
        dataChannel.current.send(JSON.stringify({ type: "video-stopped" }));
      }
    }
  
    // 4️⃣ Stop displaying remote video as well
  if (remoteVideoRef.current) {
    remoteVideoRef.current.srcObject = null;
  }

  setLocalStream(null);
  setRemoteStream(null);
  };
  

  const startVideo = async () => {
    console.log("🎥 Starting Local Video...");
  
    try {
      // 1️⃣ Get the camera and microphone stream again
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  
      // 2️⃣ Set the stream to state and update UI
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
  
      // 3️⃣ Add video track back to peer connection
      if (peerConnection.current) {
        stream.getTracks().forEach((track) => {
          peerConnection.current?.addTrack(track, stream);
        });
      }
  
      console.log("✅ Local video started again.");
    } catch (error) {
      console.error("❌ Error starting video:", error);
    }
  };
  

  useEffect(() => {
    if (!socket) return;
  
    socket.on("video-stopped", () => {
      console.log("Remote user stopped video.");
  
      // Stop displaying remote video
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
  
      setRemoteStream(null);
    });
  
    return () => {
      socket.off("video-stopped");
    };
  }, [socket]);
  
  
  return (
    <Layout>
      <div className="flex h-screen bg-gray-50 text-gray-800">

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-600">Anonymous Video Chat</h1>
            <h4 className="text-lg font-semibold">Anonymous User `${username}`</h4>
            {/* View Profile Button */}
            <div
              className="text-blue-600 border border-blue-300 hover:bg-blue-50 px-4 py-2 rounded-lg cursor-pointer"
              onClick={() => setIsProfileDialogOpen(true)}
            >
              View Profile
            </div>
          </header>

          {/* Profile Dialog */}
          {isProfileDialogOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-12 w-12 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold">Anonymous User</h2>
                  <p className="text-sm text-gray-500 text-center">
                    Your identity is protected. Enjoy anonymous conversations!
                  </p>
                  <button
                    onClick={() => setIsProfileDialogOpen(false)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {isWaiting && (
            <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-10">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h2 className="text-lg font-semibold text-gray-700">Waiting for another user to join...</h2>
                <div className="mt-4">
                  <div className="loader" />
                </div>
              </div>
            </div>
          )}

          {/* Video Call Area */}
          <div className="flex-1 p-4 flex flex-col items-center">
            <div className="relative w-full max-w-4xl aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4 border-2 border-solid border-green-400">
              <div className="absolute inset-0 flex items-center justify-center">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-[90%] h-full rounded-lg shadow-md border-2 border-dotted border-red-500 object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-[90%] h-full rounded-lg shadow-md pointer-events-none border-2 border-solid border-black object-cover"
                />

              </div>
              {/* Stranger's Video */}
              <div className="absolute bottom-4 right-4 w-1/4 aspect-video bg-blue-100 rounded-lg flex items-center justify-center">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full rounded-lg shadow-md"
                ></video>
              </div>
            </div>

            <div className="flex space-x-6">
              {/* Start video Button */}
              <div className="px-4 py-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 cursor-pointer" onClick={() => {
                console.log("Start action triggered");
                createOffer();
              }}>
                <FiSend className="h-6 w-6 mr-2 inline" />
                Connect
              </div>
              {localStream ? (
                <div
                  className="px-4 py-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer"
                  onClick={() => {
                    console.log("Stopping Local Video...");
                    stopVideo();
                  }}
                >
                  <Play className="h-6 w-6 mr-2 inline" />
                  Stop Video
                </div>
              ) : (
                <div
                  className="px-4 py-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer"
                  onClick={startVideo} // ✅ Start Local Video Again
                >
                  <Play className="h-6 w-6 mr-2 inline" />
                  Start Video
                </div>
              )}
              {/* <div
                className="px-4 py-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 cursor-pointer"
                onClick={() => setIsCompactLayout(!isCompactLayout)}
              >
                <span className="h-6 w-6 mr-2 inline">🧭</span>
                Shift Layout
              </div> */}
              {/* Voice Changer */}
              <div className="relative">
                <div
                  className={`px-4 py-2 rounded-full cursor-pointer ${activeVoice ? "bg-purple-200 text-purple-700" : "bg-purple-100 text-purple-600"
                    }`}
                  onClick={() => setActiveVoice(activeVoice ? null : "Normal")}
                >
                  <Wand2 className="h-6 w-6 mr-2 inline" />
                  Voice Changer
                </div>
                {activeVoice && (
                  <div className="absolute bottom-[133%] left-[48%] mt-2 bg-white shadow-lg rounded-lg p-4 w-72">
                    <h3 className="font-medium text-lg leading-none mb-2">Select Voice</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {voices.map((voice) => (
                        <div
                          key={voice.name}
                          className={`p-2 rounded-lg flex flex-col items-center justify-center cursor-pointer ${activeVoice === voice.name ? "bg-purple-100 text-purple-700 border-purple-500" : ""
                            }`}
                          onClick={() => setActiveVoice(voice.name)}
                        >
                          <voice.icon className="h-8 w-8 mb-2" />
                          <span className="text-xs">{voice.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Face Filter */}
              <div className="relative">
                <div
                  className={`px-4 py-2 rounded-full cursor-pointer ${activeFilter ? "bg-pink-200 text-pink-700" : "bg-pink-100 text-pink-600"
                    }`}
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                >
                  <FiSmile className="h-6 w-6 mr-2 inline" />
                  Face Filter
                </div>
                {isFilterDropdownOpen && (
                  <div className="absolute bottom-[133%] left-[48%] mt-2 bg-white shadow-lg rounded-lg p-4 w-72">
                    <h3 className="font-medium text-lg leading-none mb-2">Select Filter</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {filters.map((filter) => (
                        <div
                          key={filter.name}
                          className={`p-2 rounded-lg flex flex-col items-center justify-center cursor-pointer ${activeFilter === filter.name ? "bg-pink-100 text-pink-700 border-pink-500" : ""
                            }`}
                          onClick={() => {
                            console.log("Active filter ----", filter.name);
                            setActiveFilter(filter.name);
                            console.log("Active filter ---- after", filter.name);
                            setIsFilterDropdownOpen(false); // Close dropdown after selecting a filter
                          }}
                        >
                          <filter.icon className="h-8 w-8 mb-2" />
                          <span className="text-xs">{filter.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Skip Button */}
              <div
                className="px-4 py-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer"
                onClick={handleSkip}
              >
                <LuSkipForward className="h-6 w-6 mr-2 inline" />
                Skip
              </div>
            </div>

            {/* <div className="relative w-full max-w-4xl aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <video
                  ref={RemoteFilteredRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full rounded-lg shadow-md object-cover"
                ></video>
              
              </div>
            
            </div>  */}

          </div>
        </div>
      </div>
    </Layout>
  );
}
