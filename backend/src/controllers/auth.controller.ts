import { Request, Response } from "express";
import { prisma } from '../utils/prisma'
import bcrypt from "bcrypt";
import crypto from "crypto";
import { generateToken } from "../utils/jwt";
import { transporter } from "../utils/sendEmail";
import generateEmailTemplate from "../utils/emailTemplate";
import { signupSchema } from "../validations/auth.schema";
import { error } from "console";
import cloudinary from "../utils/cloudinary";
import { AuthRequest } from "../../types/express";
// SIGNUP
export const signup = async (req: Request, res: Response) => {
  try {
    console.log("sign up calling", req.body)
    const { name, email, password } = req.body;
   
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "User exists" });
    }
    const hashed = await bcrypt.hash(password, 10);

    const verifyToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        verifyToken,
      },
    });

    console.log("user created ", user)
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
      html: html,
    });


    return res.status(200).json({ message: "Signup successful. Check email." });
  } catch (err) {
    console.log("error in signup", error)
    return res.status(500).json({ error: "Signup failed" });
  }
};

// VERIFY EMAIL

export const verifyEmail = async (
  req: Request<{ token: string }>,
  res: Response
) => {
  const token = req.params.token;

  const user = await prisma.user.findFirst({
    where: { verifyToken: token },
  });

  if (!user) return res.status(400).json({ message: "Invalid token" });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verifyToken: null,
    },
  });

  return res.json({ message: "Email verified" });
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    console.log(req.body)

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    console.log(user)

    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify email first" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Please enter correct password" });
    }
    
    const token = generateToken(user.id);
    if (!token) {
      console.log("no token generated");
      return res.status(500).json({ message: "Failed to generate token" });
    }
    
    // ✅ Set cookie AND send response in ONE return
    const { password: _, ...userWithoutPassword } = user;
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,        
      sameSite: "lax",     
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    
    // ✅ Return the response with cookie
    return res.status(200).json({ 
      message: "Login successful",
      user: userWithoutPassword 
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};




// GET PROFILE
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
  const userId = req.userId as string;
    console.log("calling",userId)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

 return res.status(200).json({user: user});
  } catch (error) {
     console.log("error in update user", error)
    return res.status(500).json({ error: "server error " });
  }
};

// UPDATE USER (with image upload)
export const updateUser = async (req: AuthRequest , res: Response) => {
  try {
  const userId = req.userId as string;

    const { name } = req.body;

    let imageUrl;


    if (req.file) {
      const result = await cloudinary.uploader.upload_stream(
        { folder: "snapcv" },
        async (error, result: any) => {
          if (error) {
            console.log("clodnary error", error)
            return res.status(400).json({
              message: "server error"
            })
          };

          imageUrl = result.secure_url;

           const user= await prisma.user.update({
            where: { id: userId },
            data: {
              name,
              image: imageUrl,
            },
          });
          console.log(updateUser)
          return res.status(200).json({
            user: user
          });
        }
      );

     return result.end(req.file.buffer);
    } else {
       const User = await prisma.user.update({
        where: { id: userId },
        data: { name },
      });

      console.log(updateUser)
      return res.status(200).json({
       user: User
      });
    }

  } catch (error) {
    console.log("error in update user", error)
    return res.status(500).json({ error: "server error " });
  }


};


export const logout = (req: Request, res: Response) => {
  // Clear the cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // match login cookie
    sameSite: "lax",
    path: "/", // same path as login cookie
  });

  return res.json({ message: "Logged out successfully" });
};