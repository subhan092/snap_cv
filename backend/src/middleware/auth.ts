import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.log("cokkies",req.cookies)
    const token = req.cookies.token; 

  if (!token) return res.status(401).json({ message: "please login first" });
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: number };

    (req as any).userId = decoded.id;

   return next();
  } catch {
     return res.status(401).json({ message: "Invalid token" });
  }
};