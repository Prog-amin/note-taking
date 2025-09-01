import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

// Extend Request with generics to ensure body/params/query types exist
export interface AuthRequest extends Request<any, any, any, any> {
  user?: { id: string; email: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : undefined;
    if (!token) return res.status(401).json({ error: "Missing bearer token" });
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
