import { Router } from "express";
import { prisma } from "../prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { signAccessToken } from "../utils/jwt";

const router = Router();

const OTP_TTL_MINUTES = 10;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : undefined;

const startSchema = z.object({
  email: z.string().email(),
  flow: z.enum(["signup", "signin"]),
  name: z.string().min(1).optional(),
  dateOfBirth: z.string().optional(),
});

router.post("/otp/start", async (req, res) => {
  const parse = startSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid input", details: parse.error.flatten() });
  const { email, flow, name, dateOfBirth } = parse.data;
  try {
    // Create a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(code, 10);

    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    // Optionally associate with existing user
    const user = await prisma.user.findUnique({ where: { email } });

    await prisma.otp.create({
      data: {
        email,
        codeHash,
        purpose: flow === "signup" ? "SIGNUP" : "SIGNIN",
        expiresAt,
        userId: user?.id,
      },
    });

    // In real app, send email. For dev, log to server console.
    console.log(`OTP for ${email}:`, code);

    // Return devCode only outside production to aid local testing
    const response: any = { ok: true, message: "OTP sent" };
    if (process.env.NODE_ENV !== "production") {
      response.devCode = code;
    }
    return res.json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to start OTP" });
  }
});

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(10),
  flow: z.enum(["signup", "signin"]),
  name: z.string().min(1).optional(),
  dateOfBirth: z.string().optional(),
});

router.post("/otp/verify", async (req, res) => {
  const parse = verifySchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid input", details: parse.error.flatten() });
  const { email, code, flow, name, dateOfBirth } = parse.data;
  try {
    const otp = await prisma.otp.findFirst({
      where: { email, consumed: false },
      orderBy: { createdAt: "desc" },
    });
    if (!otp) return res.status(400).json({ error: "No OTP requested" });
    if (otp.expiresAt < new Date()) return res.status(400).json({ error: "OTP expired" });
    const ok = await bcrypt.compare(code, otp.codeHash);
    if (!ok) return res.status(400).json({ error: "Incorrect OTP" });

    // consume
    await prisma.otp.update({ where: { id: otp.id }, data: { consumed: true } });

    // find/create user
    let user = await prisma.user.findUnique({ where: { email } });
    if (flow === "signup") {
      if (!user) {
        user = await prisma.user.create({ data: { email, name, dateOfBirth } });
      }
    } else {
      if (!user) return res.status(404).json({ error: "User not found" });
    }

    const accessToken = signAccessToken({ sub: user!.id, email: user!.email });

    return res.json({
      ok: true,
      accessToken,
      user: { id: user!.id, email: user!.email, name: user!.name, dateOfBirth: user!.dateOfBirth },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
});

const googleSchema = z.object({ idToken: z.string().min(10) });

router.post("/google", async (req, res) => {
  if (!googleClient) return res.status(500).json({ error: "Google client not configured" });
  const parse = googleSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid input" });
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: parse.data.idToken, audience: googleClientId });
    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
      return res.status(400).json({ error: "Invalid Google token" });
    }

    let user = await prisma.user.findFirst({ where: { OR: [{ googleId: payload.sub }, { email: payload.email }] } });
    if (!user) {
      user = await prisma.user.create({ data: { email: payload.email, name: payload.name ?? null, googleId: payload.sub } });
    } else if (!user.googleId) {
      user = await prisma.user.update({ where: { id: user.id }, data: { googleId: payload.sub } });
    }

    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    return res.json({ ok: true, accessToken, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Google auth failed" });
  }
});

export default router;
