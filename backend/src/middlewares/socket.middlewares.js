import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const socketAuthMiddleware = async (socket, next) => {
  try{
    const token = socket.handshake.auth?.token;
    if(!token) {
      return next(new Error("Authentication error: Token không tồn tại"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if(!decoded) {
      return next(new Error("Authentication error: Token không hợp lệ"));
    }

    const user = await User.findById(decoded.userId).select("-hashedPassword");

    if(!user) {
      return next(new Error("Authentication error: User không tồn tại"));
    }

    socket.user = user;

    next();
  } catch (error) {
    console.error("Lỗi khi verify JWT trong socket middleware", error);
    return next(new Error("Unauthorized"));
  }

}