const { createServer } = require('http');
const next = require("next");
const { Server } = require("socket.io");
const {handleSocketConnection} = require("./src/socket/socketHandler.js")
const { handleChatSocketConnection } = require("./src/socket/chatSocketHandler.js"); 


const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
console.log(`running server on http: port ${port}`);

console.log("Starting the server...");
app.prepare().then(() => {
  console.log("Next.js app prepared.");
  const httpServer = createServer(handler);
  
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  console.log("Socket.io initialized.");
  io.on("connection", (socket) => {
    console.log("New connection in server.js file:", socket.id);
    handleSocketConnection(socket, io);
    handleChatSocketConnection(socket, io); // Handle text chat
  });

  httpServer
    .once("error", (err) => {
      console.error("Error in HTTP server:", err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Server Ready on http://${hostname}:${port}`);
    });
}).catch((err) => {
  console.error("Error during app preparation:", err);
});
