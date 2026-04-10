import express from "express";
import {
  createResume,
  getAllResumes,
  getResumeById,
  updateResume,
  deleteResume
} from "../controllers/resume.controller";

import { protect } from "../middleware/auth";

const router = express.Router();

router.post("/resume/create", protect, createResume);
router.get("/resume/all", protect, getAllResumes);
router.get("/resume/:id", protect, getResumeById);
router.put("/resume/:id", protect, updateResume);
router.delete("/resume/:id", protect, deleteResume);

export default router;