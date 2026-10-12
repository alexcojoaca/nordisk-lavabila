import type { APIRoute } from "astro";
import { redirectTo } from "../../lib/auth";
import { addMessage } from "../../lib/store";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const name = String(form.get("name") || "").trim();
  const contact = String(form.get("contact") || "").trim();
  const message = String(form.get("message") || "").trim();

  if (name.length < 2 || contact.length < 3 || message.length < 5) {
    return redirectTo(request, "/despre?eroare=1#mesaj");
  }

  await addMessage({ name, contact, message });
  return redirectTo(request, "/despre?trimis=1#mesaj");
};
