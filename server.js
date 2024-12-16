import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
console.log("runnign server")

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);
 
  
  io.on("connection",(socket)=>{
    // socket.on('join-room' , data=>{
    //   const {roomId , emailId} = data;
    // }  ) // event name join room we are getting roomid and emailid tojoin the room 
  })

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});