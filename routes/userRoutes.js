import { Router } from "express";
import {
  register,
  login,
  getAvatars,
  setAvatar,
  getContacts,
  addContact,
} from "../controllers/userController.js";

const route = Router();

route.post("/register", register);
route.post("/login", login);
route.get("/setavatar", getAvatars);
route.post("/setavatar/:id", setAvatar);
route.get("/allusers/:id", getContacts);
route.post("/addcontact", addContact);



export { route };
