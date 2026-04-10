import { z } from "zod";



// For API responses
export interface CreateResumeResponse {
  resume: Resume;  // If backend wraps it
}

// ── User ──
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  isVerified: z.boolean(),
  avatar: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type User = z.infer<typeof userSchema>;

// ── Auth ──
export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

// ── Resume Content ──
export const basicInfoSchema = z.object({
  firstName: z.string().optional().default(""),
  lastName: z.string().optional().default(""),
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  location: z.string().optional().default(""),
  professionalTitle: z.string().optional().default(""),
  summary: z.string().optional().default(""),
});

export const socialLinksSchema = z.object({
  linkedin: z.string().optional().default(""),
  github: z.string().optional().default(""),
  website: z.string().optional().default(""),
  twitter: z.string().optional().default(""),
});

export const educationItemSchema = z.object({
  institution: z.string().optional().default(""),
  degree: z.string().optional().default(""),
  field: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  description: z.string().optional().default(""),
});

export const experienceItemSchema = z.object({
  company: z.string().optional().default(""),
  position: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  current: z.boolean().optional().default(false),
  description: z.string().optional().default(""),
});

export const projectItemSchema = z.object({
  name: z.string().optional().default(""),
  description: z.string().optional().default(""),
  technologies: z.string().optional().default(""),
  link: z.string().optional().default(""),
});

export const resumeContentSchema = z.object({
  basicInfo: basicInfoSchema.default({}),
  socialLinks: socialLinksSchema.default({}),
  education: z.array(educationItemSchema).default([]),
  experience: z.array(experienceItemSchema).default([]),
  projects: z.array(projectItemSchema).default([]),
  skills: z.array(z.string()).default([]),
});

export type BasicInfo = z.infer<typeof basicInfoSchema>;
export type SocialLinks = z.infer<typeof socialLinksSchema>;
export type EducationItem = z.infer<typeof educationItemSchema>;
export type ExperienceItem = z.infer<typeof experienceItemSchema>;
export type ProjectItem = z.infer<typeof projectItemSchema>;
export type ResumeContent = z.infer<typeof resumeContentSchema>;
  

export const resumeSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: resumeContentSchema,
  userId: z.string(),
  template : z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Resume = z.infer<typeof resumeSchema>;

export const resumeFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: resumeContentSchema,
});
export type ResumeFormInput = z.infer<typeof resumeFormSchema>;

export const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  password: z.string().min(6).optional(),
  avatar: z.string().optional(),
});
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
