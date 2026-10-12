import type { APIRoute } from "astro";
import { checkPassword, cookieOptions, hashPassword, sign } from "../../../lib/auth";
import { addSubscriber, digits, findByPhone } from "../../../lib/store";

export const prerender = false;

function go(request: Request, path: string) {
  return Response.redirect(new URL(path, request.url), 303);
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  const firstName = String(form.get("firstName") || "").trim();
  const lastName = String(form.get("lastName") || "").trim();
  const phone = String(form.get("phone") || "").trim();
  const password = String(form.get("password") || "");
  const phoneKey = digits(phone);

  if (firstName.length < 2 || lastName.length < 2 || phoneKey.length < 8 || password.length < 6) {
    return go(request, "/blue-card?eroare=completeaza");
  }

  const existing = await findByPhone(phoneKey);
  if (existing) {
    if (checkPassword(password, existing.passwordHash)) {
      cookies.set("nordisk_member", sign(existing.id), cookieOptions(request));
      return go(request, "/blue-card/cont");
    }
    return go(request, "/blue-card?eroare=exista");
  }

  const subscriber = await addSubscriber({
    firstName,
    lastName,
    phone,
    phoneKey,
    passwordHash: hashPassword(password),
  });
  if (!subscriber) return go(request, "/blue-card?eroare=exista");

  cookies.set("nordisk_member", sign(subscriber.id), cookieOptions(request));
  return go(request, "/blue-card/cont");
};
