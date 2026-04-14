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

const optionalString = z.string().trim().max(200, "Max 200 characters").optional().or(z.literal(""));

const urlField = z
  .string()
  .trim()
  .url("Invalid URL")
  .max(255, "URL too long (max 255 chars)")
  .optional()
  .or(z.literal(""));

// Update dateField to accept full date format
const dateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Invalid date format (YYYY-MM-DD)",
  })

// 🔹 Basic Info (updated with max limits)
export const basicInfoSchema = z.object({
  firstName: z.string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(30, "First name too long (max 30 chars)"),


  lastName: z.string()
    .trim()
    .max(20, "Last name too long (max 20 chars)")
    .optional()
    .or(z.literal("")),

  email: z.string()
    .trim()
    .email("Invalid email")
    .max(50, "Email too long (max 50 chars)"),

  phone: z.string()
    .trim()
    .min(7, "Invalid phone number")
    .max(15, "Phone number too long (max 15 digits)"),

  location: z.string()
    .trim()
    .max(100, "Location too long (max 100 chars)")
    .optional()
    .or(z.literal("")),

  professionalTitle: z.string()
    .trim()
    .min(2, "Title is required")
    .max(100, "Title too long (max 100 chars)"),

  summary: z.string()
    .trim()
    .max(500, "Summary too long (max 500 chars)")
    .optional()
    .or(z.literal("")),
});

// 🔹 Social Links (already has urlField with max 255)
export const socialLinksSchema = z.object({
  linkedin: urlField,
  github: urlField,
  website: urlField,
  twitter: urlField,
});

// 🔹 Education (updated with max limits)
export const educationItemSchema = z.object({
  institution: z.string()
    .trim()
    .min(2, "Institution required")
    .max(30, "Institution name too long (max 30 chars)"),

  degree: z.string()
    .trim()
    .max(30, "Degree too long (max 30 chars)")
    .min(2, "degree required"),

  field: z.string()
    .trim()
    .max(40, "Field too long (max 40 chars)")
    .min(2, "field required"),

  startDate: dateField,  
  endDate: z.union([dateField, z.literal("")]),
  current: z.boolean().optional().default(false),
  description: z.string()
    .trim()
    .max(1000, "Description too long (max 1000 chars)")
    .optional()
    .or(z.literal("")),
}).refine((data) => {
    if (!data.current && !data.endDate) return false;
    return true;
  }, {
    message: "End date is required",
    path: ["endDate"],
  }).refine((data) => {
    if (!data.current && !data.endDate) return false;
    return true;
  }, {
    message: "End date is required",
    path: ["endDate"],
  })

  //  RULE 2: if both dates exist → validate order
  .refine((data) => {
    if (data.current) return true;

    if (!data.startDate || !data.endDate) return true;

    return new Date(data.endDate) > new Date(data.startDate);
  }, {
    message: "End date must be greater than start date",
    path: ["endDate"],
  });

// 🔹 Experience (updated with max limits)
export const experienceItemSchema = z.object({
  company: z.string()
    .trim()
    .min(2, "Company required")
    .max(200, "Company name too long (max 200 chars)"),
  
  position: z.string()
    .trim()
    .min(2, "Position required")
    .max(100, "Position too long (max 100 chars)"),
  
  startDate: dateField,
  endDate: z.union([dateField, z.literal("")]),
  current: z.boolean().optional().default(false), 
  description: optionalString,
}).refine((data) => {
    if (!data.current && !data.endDate) return false;
    return true;
  }, {
    message: "End date is required",
    path: ["endDate"],
  })

  //  RULE 2: if both dates exist → validate order
  .refine((data) => {
    if (data.current) return true;

    if (!data.startDate || !data.endDate) return true;

    return new Date(data.endDate) > new Date(data.startDate);
  }, {
    message: "End date must be greater than start date",
    path: ["endDate"],
  });

// 🔹 Projects (updated with max limits)
export const projectItemSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Project name required")
    .max(70, "Project name too long (max 70 chars)"),

  description: z.string()
    .trim()
    .max(50, "Description too long (max 50 chars)")
    .optional()
    .or(z.literal("")),

  technologies: z.string()
    .trim()
    .max(200, "Technologies too long (max 200 chars)")
    .optional()
    .or(z.literal("")),

  link: urlField,
});

// 🔹 Resume Content (skills max already 20)
export const resumeContentSchema = z.object({
  basicInfo: basicInfoSchema,
  socialLinks: socialLinksSchema,
  education: z.array(educationItemSchema).default([]),
  experience: z.array(experienceItemSchema).default([]),
  projects: z.array(projectItemSchema).default([]),
  skills: z
    .array(z.string().trim().min(1, "Skill cannot be empty").max(50, "Skill too long (max 50 chars)"))
    .max(20, "Max 20 skills allowed")
    .default([]),
});

// 🔹 Types
export type BasicInfo = z.infer<typeof basicInfoSchema>;
export type SocialLinks = z.infer<typeof socialLinksSchema>;
export type EducationItem = z.infer<typeof educationItemSchema>;
export type ExperienceItem = z.infer<typeof experienceItemSchema>;
export type ProjectItem = z.infer<typeof projectItemSchema>;
export type ResumeContent = z.infer<typeof resumeContentSchema>;

// 🔹 Resume Schema (DB)
export const resumeSchema = z.object({
  id: z.string(),
  title: z.string().trim().min(1, "Title required").max(100, "Title too long (max 100 chars)"),
  content: resumeContentSchema,
  userId: z.string(),
  template: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Resume = z.infer<typeof resumeSchema>;

// 🔹 Form Schema
export const resumeFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100, "Title too long (max 100 chars)"),
  content: resumeContentSchema,
});

export type ResumeFormInput = z.infer<typeof resumeFormSchema>;

export const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  password: z.string().min(6).optional(),
  avatar: z.string().optional(),
});
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
