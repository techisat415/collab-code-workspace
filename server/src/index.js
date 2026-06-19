import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import cookie from "cookie";

import { Server } from "socket.io";

import registerSocketHandlers from "./socket/index.js";
import startAutosaveService from "./services/autosaveService.js";
import authRoutes from "./routes/authRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import { verifyToken } from "./utils/jwt.js";

const app = express();

app.use(cors(
  {
    origin: "http://localhost:5173",
    credentials: true,
  }
));
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use("/workspace", workspaceRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Collaborative Workspace",
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use((socket, next) => {
  try {
    const cookies = socket.handshake.headers.cookie || "";
    const token = cookies.token;

    if(!token) {
      return next(new Error("Authentication error"));
    }

    const user = verifyToken(token);
    socket.user = user;
    next();

  }
  catch (err) {
    console.error("Socket authentication error:", err);
    next(new Error("Authentication error"));
  }
});

registerSocketHandlers(io);

startAutosaveService();

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});