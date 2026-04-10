import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { generateToken } from "../utils/jwt";
import { transporter } from "../utils/sendEmail";
import generateEmailTemplate from "../utils/emailTemplate";
import cloudinary from "../utils/cloudinary";
import { AuthRequest } from "../../types/express";

// ✅ ENV setup (default → production safe)
const ENV = process.env.NODE_ENV || "production";

// ✅ Reusable cookie config
const cookieOptions = {
  httpOnly: true,
  secure: ENV === "production",              // HTTPS in production
  sameSite: ENV === "production" ? "none" : "lax" as "none" | "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ================= SIGNUP =================
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "User exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        verifyToken,
      },
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify/${verifyToken}`;

    const html = generateEmailTemplate({
      title: "Verify your email",
      message: "Thanks for signing up. Please verify your email address.",
      buttonText: "Verify Email",
      buttonUrl: verifyUrl,
    });

    await transporter.sendMail({
      from: "SnapCV <noreply@snapcv.com>",
      to: email,
      subject: "Verify your email",
      html,
    });

    return res
      .status(200)
      .json({ message: "Signup successful. Check email." });
  } catch (err) {
    console.log("error in signup", err);
    return res.status(500).json({ error: "Signup failed" });
  }
};

// ================= VERIFY EMAIL =================
export const verifyEmail = async (
  req: Request<{ token: string }>,
  res: Response
) => {
  const token = req.params.token;

  const user = await prisma.user.findFirst({
    where: { verifyToken: token },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid token" });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verifyToken: null,
    },
  });

  return res.json({ message: "Email verified" });
};

// ================= LOGIN =================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res
        .status(400)
        .json({ message: "Please verify email first" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(400)
        .json({ message: "Please enter correct password" });
    }

    const token = generateToken(user.id);

    const { password: _, ...userWithoutPassword } = user;

    // ✅ Set cookie
    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET PROFILE =================
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return res.status(200).json({ user });
  } catch (error) {
    console.log("error in getProfile", error);
    return res.status(500).json({ error: "server error" });
  }
};

// ================= UPDATE USER =================
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const { name } = req.body;

    if (req.file) {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "snapcv" },
        async (error, result: any) => {
          if (error) {
            return res.status(400).json({ message: "Upload error" });
          }

          const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
              name,
              image: result.secure_url,
            },
          });

          return res.status(200).json({ user: updatedUser });
        }
      );

      return stream.end(req.file.buffer);
    } else {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { name },
      });

      return res.status(200).json({ user: updatedUser });
    }
  } catch (error) {
    console.log("error in update user", error);
    return res.status(500).json({ error: "server error" });
  }
};

// ================= LOGOUT =================
export const logout = (req: Request, res: Response) => {
  res.clearCookie("token", cookieOptions);

  return res.json({ message: "Logged out successfully" });
};