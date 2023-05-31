import { Router } from "express";
import { query } from "../controllers/queryController.js";

const route = Router();

route.get("/query", query);

export { route };
