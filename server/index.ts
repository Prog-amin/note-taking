import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import authRouter from "./routes/auth";
import notesRouter from "./routes/notes";
import { requireAuth, AuthRequest } from "./middleware/auth";
import { prisma } from "../server/prisma";

export function createServer() {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || true,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth and Notes routes
  app.use("/api/auth", authRouter);
  app.use("/api/notes", notesRouter);

  // Current user info
  app.get("/api/me", requireAuth, async (req, res) => {
    try {
      const userId = (req as AuthRequest).user!.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, dateOfBirth: true, createdAt: true },
      });
      return res.json({ ok: true, user });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  return app;
}
