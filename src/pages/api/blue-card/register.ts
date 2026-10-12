import type { APIRoute } from "astro";
import { checkPassword, hashPassword, redirectTo, sign } from "../../../lib/auth";
import { addSubscriber, digits, findByPhone } from "../../../lib/store";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const firstName = String(form.get("firstName") || "").trim();
  const lastName = String(form.get("lastName") || "").trim();
  const phone = String(form.get("phone") || "").trim();
  const password = String(form.get("password") || "");
  const phoneKey = digits(phone);

  if (firstName.length < 2 || lastName.length < 2 || phoneKey.length < 8 || password.length < 6) {
    return redirectTo(request, "/blue-card?eroare=completeaza#formular");
  }

  const existing = await findByPhone(phoneKey);
  if (existing) {
    if (checkPassword(password, existing.passwordHash)) {
      return redirectTo(request, "/blue-card/cont", { set: ["nordisk_member", sign(existing.id)] });
    }
    return redirectTo(request, "/blue-card?eroare=exista#formular");
  }

  const subscriber = await addSubscriber({
    firstName,
    lastName,
    phone,
    phoneKey,
    passwordHash: hashPassword(password),
  }).catch(() => undefined);
  if (subscriber === undefined) return redirectTo(request, "/blue-card?eroare=server#formular");
  if (!subscriber) return redirectTo(request, "/blue-card?eroare=exista#formular");

  return redirectTo(request, "/blue-card/cont", { set: ["nordisk_member", sign(subscriber.id)] });
};
