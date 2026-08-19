import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import friendRoute from "./routes/friend.route.js";
import messageRoute from "./routes/message.route.js";
import conversationRoute from "./routes/conversation.route.js";
import cookieParser from "cookie-parser";
import { protectedRoute } from "./middlewares/auth.middlewares.js";
import cors from "cors";
import { app, server } from "./socket/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

//public routes
app.use("/api/auth", authRoute);

//private routes
app.use(protectedRoute); // sử dụng middlewares để private thông tin
app.use("/api/users", userRoute);
app.use("/api/friends", friendRoute);
app.use("/api/messages", messageRoute);
app.use("/api/conversations", conversationRoute);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`server bat dau tai cong ${PORT}`);
  });
});
