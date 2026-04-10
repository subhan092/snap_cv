import apiClient from "./client";
import type { Resume, ResumeContent } from "@/types";

export const resumeApi = {
  list: () =>
    apiClient.get<{ resumes: Resume[] }>("/resume/all"),

  create: (data: { title: string; content: ResumeContent }) =>
    apiClient.post<{ resume: Resume }>("/resume/create", data), 

  getById: (id: string) =>
    apiClient.get<{ resume: Resume }>(`/resume/${id}`), 

  update: (id: string, data: { title?: string; content?: ResumeContent }) =>
    apiClient.put<{ resume: Resume }>(`/resume/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/resume/${id}`),
};
