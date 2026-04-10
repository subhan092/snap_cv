import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router  from "./routes/auth.routes";
import cookieParser from "cookie-parser";
import resumeRouter from "./routes/resume.routes"

dotenv.config();

const app = express();

// middlewares
app.use(cors({
  origin: 'http://localhost:8080',  
  credentials: true,                 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser())
app.use(express.json());

app.use(router);
app.use(resumeRouter)


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});