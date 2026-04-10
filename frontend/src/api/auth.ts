import apiClient from "./client";
import type { User, SignupInput, LoginInput } from "@/types";

export const authApi = {
  signup: (data: SignupInput) =>
    apiClient.post<{ message: string }>("/signup", data),

  login: (data: LoginInput) =>
    apiClient.post<{ message: string; user: User }>("/login", data),

  logout: () =>
    apiClient.post<{ message: string }>("/logout"),

  verify: (token: string) =>
    apiClient.get<{ message: string }>(`/verify/${token}`),

  getProfile: () =>
    apiClient.get<{ user: User }>("/profile"),

  updateProfile: (data: { name?: string; password?: string; img?: string }) =>
    apiClient.put<{ user: User }>("/update", data),
};
