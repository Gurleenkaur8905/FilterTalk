const userMap = new Map(); // Maps { userId: socket.id }
const rooms = {}; // Maps { roomId: [socket.id1, socket.id2] }
const userToRoomMap = new Map(); // Maps { socket.id: roomId }
const userSkipMap = new Map(); // Maps { socket.id: Set<skippedSocketId> }
let GLOBAL_ROOM_ID = 1;

// Function to handle WebRTC signaling
function handleSignalingEvents(socket, io) {
  socket.on("offer", (data) => {
    const { offer, to } = data;
    io.to(to).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", (data) => {
    const { answer, to } = data;
    io.to(to).emit("answer", { answer, from: socket.id });
  });

  socket.on("ice-candidate", (data) => {
    const { candidate, to } = data;
    console.log("ICE Candidate received");
    io.to(to).emit("ice-candidate", { candidate });
  });
}

function pairUsers(socket, io) {
  // First, check if the user is already in a room
  if (userToRoomMap.has(socket.id)) {
    console.log(`User ${socket.id} is already in a room.`);
    return;
  }

  const skippedUsers = userSkipMap.get(socket.id) || new Set(); // Get the list of skipped users for this socket

  // Find a room with only one user
  for (const [roomId, users] of Object.entries(rooms)) {
    if (users.length === 1) {
      const waitingUserSocketId = users[0];

      // Check if the waiting user has been skipped by the current user
      if (!skippedUsers.has(waitingUserSocketId)) {
        // Add the new user to the existing room
        rooms[roomId].push(socket.id);
        userToRoomMap.set(socket.id, roomId);

        // Notify both users
        const pairedUsers = [
          { userId: userMap.get(waitingUserSocketId), socketId: waitingUserSocketId },
          { userId: userMap.get(socket.id), socketId: socket.id },
        ];

        io.to(waitingUserSocketId).emit("room-created", { roomId, users: pairedUsers });
        io.to(socket.id).emit("room-created", { roomId, users: pairedUsers });

        console.log(`User ${socket.id} paired with ${waitingUserSocketId} in room ${roomId}`);
        return; // Stop processing since pairing is complete
      }
    }
  }

  // No room with one user found, create a new room
  const roomId = `room-${GLOBAL_ROOM_ID++}`;
  rooms[roomId] = [socket.id];
  userToRoomMap.set(socket.id, roomId);

  // Join the socket to the room
  socket.join(roomId);

  console.log(`New room created: ${roomId} with User ${socket.id}`);
  io.to(socket.id).emit("waiting-for-peer", { roomId });

  // Attempt to pair another unpaired user to the new room
  for (const [userId, userSocketId] of userMap.entries()) {
    if (!userToRoomMap.has(userSocketId) && userSocketId !== socket.id && !skippedUsers.has(userSocketId)) {
      rooms[roomId].push(userSocketId);
      userToRoomMap.set(userSocketId, roomId);

      const userSocket = io.sockets.sockets.get(userSocketId);
      if (userSocket) {
        userSocket.join(roomId);
      }

      // Notify both users about the pairing
       const pairedUsers = [
        { userId: userMap.get(socket.id), socketId: socket.id },
        { userId, socketId: userSocketId },
      ];

      io.to(socket.id).emit("room-created", { roomId, users: pairedUsers });
      io.to(userSocketId).emit("room-created", { roomId, users: pairedUsers });

      console.log(`User ${userSocketId} joined new room: ${roomId}`);
      return;
    }
  }
}

function handleSkip(socket, io) {
  console.log("I am in the skip function to skip the button");
  
  const socket_skip = socket.id; // The skipping user's socket ID
  const roomId = userToRoomMap.get(socket_skip); // Get the current room of the skipping user
  
  if (!roomId) {
    console.log(`User ${socket_skip} is not in a room to skip.`);
    return;
  }

  const usersInRoom = rooms[roomId] || []; // Get the users in the current room
  const remainingUser = usersInRoom.find((id) => id !== socket_skip); // Find the other user in the room

  // Add the skipped user to the skipping user's skip list
  if (remainingUser) {
    if (!userSkipMap.has(socket_skip)) {
      userSkipMap.set(socket_skip, new Set());
    }
    userSkipMap.get(socket_skip).add(remainingUser);

    // Ensure the skipped user also skips the skipping user
    if (!userSkipMap.has(remainingUser)) {
      userSkipMap.set(remainingUser, new Set());
    }
    userSkipMap.get(remainingUser).add(socket_skip);
  }

  // Remove the skipping user from the current room
  rooms[roomId] = usersInRoom.filter((id) => id !== socket_skip);
  userToRoomMap.delete(socket_skip);

  console.log(`User ${socket_skip} skipped and left room ${roomId}`);

  // Notify the remaining user in the room, if any
  if (rooms[roomId].length === 1) {
    io.to(remainingUser).emit("peer-disconnected", { roomId });
    console.log(`Waiting for a new user to join room ${roomId}`);
  } else if (rooms[roomId].length === 0) {
    // Delete the room if it is now empty
    delete rooms[roomId];
    console.log(`Room ${roomId} is empty and has been deleted.`);
  }

  // Attempt to pair the skipping user with a new peer
  pairUsers(socket, io);
}




// Handle user disconnection
function handleDisconnect(socket, io) {
  const roomId = userToRoomMap.get(socket.id);
  if (roomId) {
    const users = rooms[roomId] || [];
    rooms[roomId] = users.filter((id) => id !== socket.id);
    console.log(`User ${socket.id} left room ${roomId}`);

    if (rooms[roomId].length === 0) {
      delete rooms[roomId];
      console.log(`Room ${roomId} deleted.`);
    } else {
      const remainingUser = rooms[roomId][0];
      io.to(remainingUser).emit("peer-disconnected", { roomId });
      console.log(`Waiting for a new user to join room ${roomId}`);
    }

    userToRoomMap.delete(socket.id);
  }

  // Remove the user from userMap on disconnection
  for (const [userId, userSocketId] of userMap.entries()) {
    if (userSocketId === socket.id) {
      userMap.delete(userId);
      break;
    }
  }

  console.log(`User ${socket.id} disconnected.`);
}

// Main socket connection handler
function handleSocketConnection(socket, io) {
  console.log("User connected:", socket.id);

  socket.on("user-id", (data) => {
    const { userId } = data;

    if (!userId) {
      console.log("Invalid userId received.");
      return;
    }

    // Check if userId already exists in userMap
    if (userMap.has(userId)) {
      const existingSocketId = userMap.get(userId);
      if (existingSocketId !== socket.id) {
        // Update the socket.id for the userId
        userMap.set(userId, socket.id);
        // console.log(`Socket ID updated for userId ${userId}: ${existingSocketId} -> ${socket.id}`);
      } else {
        console.log(`User ID ${userId} is already connected with the same socket ID.`);
      }
    } else {
      // Add new userId and socket.id to userMap
      userMap.set(userId, socket.id);
      // console.log(`User added to userMap: ${userId} -> ${socket.id}`);
    }

    // Pair users into rooms if there are at least 2 users
    if (userMap.size >= 2) {
      pairUsers(socket, io);
    }
  });

  // Delegate signaling events to a separate function
  handleSignalingEvents(socket, io);

  socket.on("skip", () => {
    console.log(`User ${socket.id} requested to skip.`);
    handleSkip(socket, io);
  });
  

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    handleDisconnect(socket, io);
  });


}

module.exports = { handleSocketConnection };
