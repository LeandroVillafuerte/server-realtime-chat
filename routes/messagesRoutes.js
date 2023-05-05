import { Router } from "express";
import { addMessage, getAllMessages } from "../controllers/messagesController.js";

const route = Router();

route.post("/addmsg", addMessage);
route.get("/getmsg/:from/:to", getAllMessages);

export { route };
