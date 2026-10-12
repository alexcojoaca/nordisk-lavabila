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

const month = 60 * 60 * 24 * 30;

export function originOf(request: Request) {
  const forwarded = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwarded || request.headers.get("host") || "";
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (host) {
    const scheme = proto || (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
    return `${scheme}://${host}`;
  }
  return new URL(request.url).origin;
}

function sessionCookie(name: string, value: string, secure: boolean, maxAge = month) {
  const parts = [`${name}=${value}`, "Path=/", "HttpOnly", "SameSite=Lax", `Max-Age=${maxAge}`];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function redirectTo(
  request: Request,
  path: string,
  extra?: { set?: [string, string]; clear?: string },
) {
  const location = new URL(path, originOf(request));
  const headers = new Headers({ Location: location.toString() });
  const secure = location.protocol === "https:";
  if (extra?.set) headers.append("Set-Cookie", sessionCookie(extra.set[0], extra.set[1], secure));
  if (extra?.clear) headers.append("Set-Cookie", sessionCookie(extra.clear, "", secure, 0));
  return new Response(null, { status: 303, statusText: "See Other", headers });
}
