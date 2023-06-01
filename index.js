import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { route as userRoutes } from "./routes/userRoutes.js";
import { route as messagesRoutes } from "./routes/messagesRoutes.js";
import { route as queryRoutes } from "./routes/queryRoute.js";
import morgan from "morgan";
import { Server } from "socket.io";
import cron from "node-cron";
import axios from "axios";

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", userRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/query", queryRoutes);

app.use(
  cors({
    origin: process.env.CORS,
  })
);

mongoose
  .connect(process.env.MONGO_URL || process.env.MONGO_URL_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.info("%cDB Connection Successful", "color:green"))
  .catch((err) => console.error(err.message));

const server = app.listen(process.env.PORT || 5000, () => {
  console.log(
    `Server Started on Port %c${process.env.PORT || 5000}`,
    "color:blue"
  );
});

const io = new Server(server, {
  cors: {
    origin: process.env.CORS,
    methods: ["GET", "POST"],
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("new connection");
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });
  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-receive", data);
    }
  });
  socket.on("contact-added", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("contact-receive", data.contact);
    }
  });
});

cron.schedule("*/10 * * * *", () => {
  (async function query() {
    try {
      const response = await axios.get(
        process.env.DEV
          ? "http://localhost:5500/api/query/query"
          : "https://chatify-api-vjqn.onrender.com/api/query/query"
      );
      console.log(response.data.msg);
    } catch (e) {
      // next(e);
      console.error(e);
    }
  })();
});
