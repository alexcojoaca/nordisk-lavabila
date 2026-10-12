import type { APIRoute } from "astro";
import { checkPassword, cookieOptions, sign } from "../../../lib/auth";
import { digits, findByPhone } from "../../../lib/store";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  const phoneKey = digits(String(form.get("phone") || ""));
  const password = String(form.get("password") || "");
  const subscriber = await findByPhone(phoneKey);

  if (!subscriber || !checkPassword(password, subscriber.passwordHash)) {
    return Response.redirect(new URL("/blue-card?eroare=intrare#intrare", request.url), 303);
  }

  cookies.set("nordisk_member", sign(subscriber.id), cookieOptions(request));
  return Response.redirect(new URL("/blue-card/cont", request.url), 303);
};
