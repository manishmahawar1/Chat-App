import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { getMessages, getUserForSidebar, markSeenMessages, sendMessage } from "../controllers/messageControllers.js";

const messageRouter = express.Router();

messageRouter.get("/users", authMiddleware, getUserForSidebar);
messageRouter.get("/:id", authMiddleware, getMessages );
messageRouter.put("/mark/:id", authMiddleware, markSeenMessages);
messageRouter.post("/send/:id", authMiddleware, sendMessage);


export default messageRouter;