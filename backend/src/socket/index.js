import { Server } from "socket.io";
import http from "http";
import express from "express";
import { socketAuthMiddleware } from "../middlewares/socket.middlewares.js";
import {getUserConversationForSocketIO} from "../controllers/conversation.controller.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

io.use(socketAuthMiddleware); // sử dụng middleware để xác thực socket

const onlineUsers = new Map(); // lưu trữ danh sách người dùng online

io.on("connection", async (socket) => {
  const user = socket.user; // lấy thông tin user từ middleware
  console.log(`${user.displayName} online voi socket ${socket.id}`);
  onlineUsers.set(user._id, socket.id);

  io.emit("onlineUsers", Array.from(onlineUsers.keys())); // gửi danh sách người dùng online cho tất cả các client

  const conversationIds = await getUserConversationForSocketIO(user._id);
  conversationIds.forEach((id) => {
    socket.join(id); // tham gia vào các phòng chat của user
  })

  socket.on("disconnect", () => {
    onlineUsers.delete(user._id);
    io.emit("onlineUsers", Array.from(onlineUsers.keys())); 
    console.log(`${user.displayName} offline voi socket ${socket.id}`);
  });
});

export { io, server, app };
