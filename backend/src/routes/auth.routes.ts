import express from "express";
import { signup, login, verifyEmail, getProfile, updateUser, logout } from "../controllers/auth.controller";
import { protect } from "../middleware/auth";
import { upload } from "../middleware/multer";

const router = express.Router();

router.post("/signup", signup);
router.post("/login" , login);
router.get("/verify/:token", verifyEmail);
router.get("/profile", protect, getProfile);
router.put("/update", protect, upload.single("image"), updateUser);
router.post("/logout", protect, logout);

export default router ;