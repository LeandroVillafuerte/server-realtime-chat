import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { route as userRoutes } from "./routes/userRoutes.js";
import { route as messagesRoutes } from "./routes/messagesRoutes.js"
import morgan from "morgan";

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", userRoutes);
app.use("/api/messages",messagesRoutes)

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.info("%cDB Connection Successful", "color:green"))
  .catch((err) => console.error(err.message));

const server = app.listen(process.env.PORT, () => {
  console.log(`Server Started on Port %c${process.env.PORT}`, "color:blue");
});
