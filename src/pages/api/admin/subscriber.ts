import type { APIRoute } from "astro";
import { readSigned } from "../../../lib/auth";
import { deleteSubscriber, setPaid } from "../../../lib/store";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  if (readSigned(cookies.get("nordisk_admin")?.value) !== "admin") {
    return Response.redirect(new URL("/admin", request.url), 303);
  }

  const form = await request.formData();
  const id = String(form.get("id") || "");
  const action = String(form.get("action") || "");

  if (action === "delete") await deleteSubscriber(id);
  if (action === "paid") await setPaid(id, true);
  if (action === "unpaid") await setPaid(id, false);

  return Response.redirect(new URL("/admin#abonati", request.url), 303);
};
