import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "mentoralm-dev-secret-change-in-prod";
const ACCESS_TOKEN_EXPIRES = "15m";
const REFRESH_TOKEN_EXPIRES = "30d";

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export const REFRESH_TOKEN_EXPIRES_MS = 30 * 24 * 60 * 60 * 1000;
