import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name is required"),

  email: z.string().email("Invalid email address"),

  password: z.string().refine(
    (val) =>
      val.length >= 8 &&
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).+$/.test(val),
    {
      message:
        "Password must contain uppercase, lowercase, number and special character and be at least 8 characters",
    }
  ),
});