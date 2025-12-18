import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { checkAuth, login, signup, updateProfile } from "../controllers/userController.js";

const userRouter = express.Router();
userRouter.post("/signup", signup );
userRouter.post("/login", login );
userRouter.put("/update-profile", authMiddleware, updateProfile);
userRouter.get("/check", authMiddleware, checkAuth)

export default userRouter;