import { Response } from "express";
import { prisma } from '../utils/prisma'
import { Prisma } from "@prisma/client";

import { AuthRequest } from '../../types/express'


export const createResume = async (req: AuthRequest, res: Response) => {
  const userId = req.userId as string;
  
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { title, content } = req.body; 
  
  try {
    const resume = await prisma.resume.create({
      data: {
        userId,
        title: title || "Untitled Resume",
        content: {
          basicInfo: content?.basicInfo || {},
          socialLinks: content?.socialLinks || {},
          education: content?.education || [],
          experience: content?.experience || [],
          projects: content?.projects || [],
          skills: content?.skills || []
        } as Prisma.JsonObject
      }
    });

    // ✅ Wrap response in { resume: ... }
    return res.json({ resume: resume });
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
// ✅ Get All Resumes (of logged-in user)
export const getAllResumes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req?.userId;
    console.log(userId)

    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    return res.json({resumes:resumes});
  } catch (error) {
    return res.status(500).json({ message: "Error fetching resumes" });
  }
};

// ✅ Get Single Resume
export const getResumeById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const userId = req?.userId;

    const resume = await prisma.resume.findFirst({
      where: { id, userId }
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.json({resume:resume});
  } catch (error) {
    return res.status(500).json({ message: "Error fetching resume" });
  }
};

// ✅ Update Resume (FULL JSON or partial merge)
export const updateResume = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req?.userId;
    const { content, title } = req.body;

    const existing = await prisma.resume.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const resume = await prisma.resume.update({
      where: { id },
      data: {
        title: title || existing.title,
        content: content
          ? { ...existing.content as object, ...content }
          : existing.content
      }
    });

    return res.json({resume: resume });
  } catch (error) {
        console.log("error in update resume",error)
    return res.status(500).json({ message: "Error updating resume" });
  }
};

// ✅ Delete Resume
export const deleteResume = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req?.userId;

    const existing = await prisma.resume.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      return res.status(404).json({ message: "Resume not found" });
    }

    await prisma.resume.delete({
      where: { id }
    });

    return res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting resume" });
  }
};