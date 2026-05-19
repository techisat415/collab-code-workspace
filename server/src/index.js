import dotenv from "dotenv";
import prisma from "./lib/prisma.js";
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
const activeRooms = {};

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", async (roomId)=>{ //room is room ID
    socket.join(roomId);

    if(activeRooms[roomId]){

      activeRooms[roomId].users.add(socket.id);

      io.to(roomId).emit(
        "room-users", 
        activeRooms[roomId].users.size
      );

      socket.emit(
        "sync-code", 
        activeRooms[roomId].code
      );

      console.log(`Loaded ${roomId} with existing code from RAM`);

      return;
    }

    let room = await prisma.room.findUnique({
      where: {
        roomId,
      },
    });

    if(!room){
      room = await prisma.room.create({
        data: {
          roomId,
          code: "",
        },
      });
      console.log(`Created new room ${roomId} in database`);
    }

    activeRooms[roomId] = {
      code: room.code,
      users: new Set([socket.id]),
      lastActivity: Date.now(),
      lastSaved: Date.now(),
    };

    socket.emit("sync-code", room.code);
    io.to(roomId).emit(
      "room-users", 
      activeRooms[roomId].users.size
    );
    console.log(`Loaded ${roomId} with code from database`);

  });

  socket.on("code-edit", ({ code, roomId }) => {

    if(!activeRooms[roomId]){
      console.error(`Room ${roomId} not found in activeRooms`);
      return;
    }

    activeRooms[roomId].code = code;
    activeRooms[roomId].lastActivity = Date.now();

    // console.log(code, roomId);

    socket.to(roomId).emit("receive-code-edit", code);

  });

  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    for(const roomId in activeRooms){
      const room = activeRooms[roomId];

      room.users.delete(socket.id);

      io.to(roomId).emit(
        "room-users",
        room.users.size
      );

      if(room.users.size === 0){
        await prisma.room.update({
          where: {
            roomId,
          },
          data: {
            code: room.code,
          },
        });

        delete activeRooms[roomId];
        console.log(`Removed room ${roomId} from RAM`);
      }
    }

  });

});

setInterval( async ()=>{
    console.log(`Autosaving rooms...`);

    for(const roomId in activeRooms){
      const room = activeRooms[roomId];

      if(
        Date.now() - room.lastActivity > 5000 &&
        room.lastSaved < room.lastActivity
      )
      {
        await prisma.room.update({
          where: {
            roomId,
          },
          data: {
            code: room.code,
          }
        });

        room.lastSaved = Date.now();
        console.log(`Saved room ${roomId} to database`);
      }


    }

  }, 5000);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});