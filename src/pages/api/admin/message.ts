import type { APIRoute } from "astro";
import { readSigned, redirectTo } from "../../../lib/auth";
import { deleteMessage } from "../../../lib/store";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  if (readSigned(cookies.get("nordisk_admin")?.value) !== "admin") {
    return redirectTo(request, "/admin");
  }

  const form = await request.formData();
  await deleteMessage(String(form.get("id") || ""));
  return redirectTo(request, "/admin?tab=nordisk");
};
