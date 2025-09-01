import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  console.warn("JWT_SECRET is not set. Set it in your .env file.");
}

export interface JwtPayload {
  sub: string; // userId
  email: string;
}

export function signAccessToken(payload: JwtPayload, expiresIn: string = "30m") {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET!) as JwtPayload;
}
