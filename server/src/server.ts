import express, { Request, Response, NextFunction } from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import Joi from "joi";
import winston from "winston";

dotenv.config();

const app = express();

const logger = winston.createLogger({
  level: "error",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log" }),
    new winston.transports.Console(),
  ],
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});

app.use(apiLimiter);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json());

const GITHUB_API_URL = process.env.GITHUB_API_URL || "https://api.github.com";

const updateReposSchema = Joi.object({
  username: Joi.string().required(),
  token: Joi.string().required(),
  repos: Joi.array().items(Joi.string()).required(),
  makePrivate: Joi.boolean().required(),
});

app.post("/update-repos", async (req: Request, res: Response) => {
  const { username, token, repos, makePrivate } = req.body;

  if (
    !username ||
    !token ||
    !Array.isArray(repos) ||
    typeof makePrivate !== "boolean"
  ) {
    logger.error("Invalid request data", { body: req.body });
    return res.status(400).send("Invalid request");
  }

  const headers = {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github.v3+json",
  };

  try {
    await Promise.all(
      repos.map(async (repo: string) => {
        const updateUrl = `${GITHUB_API_URL}/repos/${username}/${repo}`;
        await axios.patch(updateUrl, { private: makePrivate }, { headers });
      })
    );
    logger.info("Repositories updated successfully", { username, repos });
    res.status(200).send("Repositories updated successfully");
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || "Unknown error";
    logger.error("Failed to update repositories", { error: message });
    res.status(500).send(`Failed to update repositories: ${message}`);
  }
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Server error: ${err.message}`);
  res.status(500).send("Internal Server Error");
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
