import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router  from "./routes/auth.routes";
import cookieParser from "cookie-parser";
import resumeRouter from "./routes/resume.routes"

dotenv.config();


const app = express();

// middlewares
const ENV = process.env.NODE_ENV || 'development';
const CLIENT_URL = ENV === "production" 
  ? process.env.CLIENT_PRODUCTION_URL 
  : (process.env.CLIENT_URL || 'http://localhost:8080');

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser())
app.use(express.json());

app.use(router);
app.use(resumeRouter)


const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('Server running on port ',PORT);
  });
}

export default app;