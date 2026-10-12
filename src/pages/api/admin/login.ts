import type { APIRoute } from "astro";
import { cookieOptions, ownerEmail, ownerPassword, sign } from "../../../lib/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");

  if (email !== ownerEmail || password !== ownerPassword) {
    return Response.redirect(new URL("/admin?eroare=1", request.url), 303);
  }

  cookies.set("nordisk_admin", sign("admin"), cookieOptions(request));
  return Response.redirect(new URL("/admin", request.url), 303);
};
