import type { APIRoute } from "astro";
import { readSigned } from "../../../lib/auth";
import { deleteMessage } from "../../../lib/store";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  if (readSigned(cookies.get("nordisk_admin")?.value) !== "admin") {
    return Response.redirect(new URL("/admin", request.url), 303);
  }

  const form = await request.formData();
  await deleteMessage(String(form.get("id") || ""));
  return Response.redirect(new URL("/admin#cereri", request.url), 303);
};
