import type { APIRoute } from "astro";
import { readSigned, redirectTo } from "../../../lib/auth";
import { deleteSubscriber, setPaid } from "../../../lib/store";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  if (readSigned(cookies.get("nordisk_admin")?.value) !== "admin") {
    return redirectTo(request, "/admin");
  }

  const form = await request.formData();
  const id = String(form.get("id") || "");
  const action = String(form.get("action") || "");

  if (action === "delete") await deleteSubscriber(id);
  if (action === "paid") await setPaid(id, true);
  if (action === "unpaid") await setPaid(id, false);

  const q = String(form.get("q") || "").trim();
  const next = q ? `/admin?tab=card&q=${encodeURIComponent(q)}` : "/admin?tab=card";
  return redirectTo(request, next);
};
