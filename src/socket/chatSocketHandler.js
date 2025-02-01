const chatUserMap = new Map(); // Maps { userId: socket.id }
const chatRooms = {}; // Maps { roomId: [socket.id1, socket.id2] }
const chatUserToRoomMap = new Map(); // Maps { socket.id: roomId }
const chatUserSkipMap = new Map(); // Maps { socket.id: Set<skippedSocketId> }
let GLOBAL_CHAT_ROOM_ID = 1;

function pairChatUsers(socket, io) {
  console.log(`Attempting to pair User ${socket.id}`);

  if (chatUserToRoomMap.has(socket.id)) {
    console.log(`User ${socket.id} is already in a chat room.`);
    return;
  }

  const skippedUsers = chatUserSkipMap.get(socket.id) || new Set();

  for (const [roomId, users] of Object.entries(chatRooms)) {
    if (users.length === 1) {
      const waitingUserSocketId = users[0];

      if (!skippedUsers.has(waitingUserSocketId)) {
        chatRooms[roomId].push(socket.id);
        chatUserToRoomMap.set(socket.id, roomId);

        const pairedUsers = [
          { userId: chatUserMap.get(waitingUserSocketId), socketId: waitingUserSocketId },
          { userId: chatUserMap.get(socket.id), socketId: socket.id },
        ];

        io.to(waitingUserSocketId).emit("chat-room-created", { roomId, users: pairedUsers });
        io.to(socket.id).emit("chat-room-created", { roomId, users: pairedUsers });

        console.log(`User ${socket.id} paired with ${waitingUserSocketId} in chat room ${roomId}`);
        return;
      }
    }
  }

    // If no existing room was found, create a new room
  const roomId = `chat-room-${GLOBAL_CHAT_ROOM_ID++}`;
  chatRooms[roomId] = [socket.id];
  chatUserToRoomMap.set(socket.id, roomId);
  socket.join(roomId);

  console.log(`New chat room created: ${roomId} with User ${socket.id}`);
  io.to(socket.id).emit("chat-waiting-for-peer", { roomId });
    // Try pairing the second user in the newly created room

  for (const [userId, userSocketId] of chatUserMap.entries()) {
    if (!chatUserToRoomMap.has(userSocketId) && userSocketId !== socket.id && !skippedUsers.has(userSocketId)) {
      chatRooms[roomId].push(userSocketId);
      chatUserToRoomMap.set(userSocketId, roomId);

      const userSocket = io.sockets.sockets.get(userSocketId);
      if (userSocket) {
        userSocket.join(roomId);
      }

      const pairedUsers = [
        { userId: chatUserMap.get(socket.id), socketId: socket.id },
        { userId, socketId: userSocketId },
      ];

      io.to(socket.id).emit("chat-room-created", { roomId, users: pairedUsers });
      io.to(userSocketId).emit("chat-room-created", { roomId, users: pairedUsers });

      console.log(`User ${userSocketId} joined chat room: ${roomId}`);
      return;
    }
  }
}

function handleChatSkip(socket, io) {
  console.log(`User ${socket.id} wants to skip chat`);

  const socket_skip = socket.id;
  const roomId = chatUserToRoomMap.get(socket_skip);

  if (!roomId) {
    console.log(`User ${socket_skip} is not in a chat room.`);
    return;
  }

  const usersInRoom = chatRooms[roomId] || [];
  const remainingUser = usersInRoom.find((id) => id !== socket_skip);
  

  if (remainingUser) {
    if (!chatUserSkipMap.has(socket_skip)) {
      chatUserSkipMap.set(socket_skip, new Set());
    }
    chatUserSkipMap.get(socket_skip).add(remainingUser);

    if (!chatUserSkipMap.has(remainingUser)) {
      chatUserSkipMap.set(remainingUser, new Set());
    }
    chatUserSkipMap.get(remainingUser).add(socket_skip);
  }

  chatRooms[roomId] = usersInRoom.filter((id) => id !== socket_skip);
  chatUserToRoomMap.delete(socket_skip);

  console.log(`User ${socket_skip} skipped and left chat room ${roomId}`);

  if (chatRooms[roomId].length === 1) {
    io.to(remainingUser).emit("chat-peer-disconnected", { roomId });
    console.log(`Waiting for a new user to join chat room ${roomId}`);
  } else if (chatRooms[roomId].length === 0) {
    delete chatRooms[roomId];
    console.log(`Chat room ${roomId} deleted.`);
  }

  pairChatUsers(socket, io);
}

function handleChatDisconnect(socket, io) {
  const roomId = chatUserToRoomMap.get(socket.id);
  if (roomId) {
    const users = chatRooms[roomId] || [];
    chatRooms[roomId] = users.filter((id) => id !== socket.id);
    console.log(`User ${socket.id} left chat room ${roomId}`);

    if (chatRooms[roomId].length === 0) {
      delete chatRooms[roomId];
      console.log(`Chat room ${roomId} deleted.`);
    } else {
      const remainingUser = chatRooms[roomId][0];
      io.to(remainingUser).emit("chat-peer-disconnected", { roomId });
      console.log(`Waiting for a new user to join chat room ${roomId}`);
    }

    chatUserToRoomMap.delete(socket.id);
  }

  for (const [userId, userSocketId] of chatUserMap.entries()) {
    if (userSocketId === socket.id) {
      chatUserMap.delete(userId);
      break;
    }
  }

  console.log(`Chat user ${socket.id} disconnected.`);
}

function handleChatSocketConnection(socket, io) {
  console.log("Chat user connected:", socket.id);

   // Send a "connected" message when a user connects
   socket.emit("connected", { message: "You are successfully connected!" });

  socket.on("user-id", (data) => {
    const { userId } = data;

    if (!userId) {
      console.log("Invalid chat userId received.");
      return;
    }

    if (chatUserMap.has(userId)) {
      const existingSocketId = chatUserMap.get(userId);
      if (existingSocketId !== socket.id) {
        chatUserMap.set(userId, socket.id);
      } else {
        console.log(`Chat user ID ${userId} is already connected.`);
      }
    } else {
      chatUserMap.set(userId, socket.id);
    }

    if (chatUserMap.size >= 2) {
      pairChatUsers(socket, io);
    }
  });

  socket.on("send-message", (data) => {
    const roomId = chatUserToRoomMap.get(socket.id);
    if (roomId) {
      console.log(`*****************Message received from ${socket.id}:`, data.message);
        // Get all users in the room
    const usersInRoom = chatRooms[roomId] || [];

      // Emit the message to all users except the sender
    usersInRoom.forEach((userSocketId) => {
      if (userSocketId !== socket.id) { // Skip the sender
        console.log(`Sending message to ${userSocketId}`);
        io.to(userSocketId).emit("receive-message", { message: data.message });
      }
    });
  } else {
    console.log("Socket is not in any room, cannot send message.");
  }
  });

  socket.on("chat-skip", () => {
    console.log(`User ${socket.id} requested to skip chat.`);
    handleChatSkip(socket, io);
  });

  socket.on("disconnect", () => {
    console.log(`Chat user disconnected: ${socket.id}`);
    handleChatDisconnect(socket, io);
  });
}

module.exports = { handleChatSocketConnection };
