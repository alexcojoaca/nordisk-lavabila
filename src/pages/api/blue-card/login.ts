import type { APIRoute } from "astro";
import { checkPassword, redirectTo, sign } from "../../../lib/auth";
import { digits, findByPhone } from "../../../lib/store";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const phoneKey = digits(String(form.get("phone") || ""));
  const password = String(form.get("password") || "");
  const subscriber = await findByPhone(phoneKey);

  if (!subscriber || !checkPassword(password, subscriber.passwordHash)) {
    return redirectTo(request, "/blue-card?eroare=intrare#conectare");
  }

  return redirectTo(request, "/blue-card/cont", { set: ["nordisk_member", sign(subscriber.id)] });
};
