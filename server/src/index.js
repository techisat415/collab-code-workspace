import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Collaborative Code Editor",
  });
});

const server = http.createServer(app);
const roomCode = {};

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId)=>{ //room is room ID
    socket.join(roomId);

    if(roomCode[roomId]){
      socket.emit("sync-code", roomCode[roomId]);
    }

    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on("code-edit", ({ code, roomId }) => {

    roomCode[roomId] = code;
    
    console.log(code, roomId);

    socket.to(roomId).emit("receive-code-edit", code);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});