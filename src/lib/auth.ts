import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const secret = process.env.SESSION_SECRET || "nordisk-session-7f3a9c2e";

export const ownerEmail = "nordiskgrup@gmail.com";
export const ownerPassword = "Test1234";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function checkPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32);
  const current = Buffer.from(hash, "hex");
  if (next.length !== current.length) return false;
  return timingSafeEqual(next, current);
}

export function sign(value: string) {
  const body = Buffer.from(value).toString("base64url");
  const mac = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function readSigned(token: string | undefined) {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  const left = Buffer.from(mac);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  return Buffer.from(body, "base64url").toString();
}

export function cookieOptions(request?: Request) {
  const secure = request ? new URL(request.url).protocol === "https:" : false;
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}
