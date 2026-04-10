// types/express.d.ts
import { Request } from "express";

export interface AuthRequest extends Request {
  userId?: string; // ya string (depending on your schema)
}