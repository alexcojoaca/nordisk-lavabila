import type { APIRoute } from "astro";
import { ownerEmail, ownerPassword, redirectTo, sign } from "../../../lib/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");

  if (email !== ownerEmail || password !== ownerPassword) {
    return redirectTo(request, "/admin?eroare=1");
  }

  return redirectTo(request, "/admin", { set: ["nordisk_admin", sign("admin")] });
};
