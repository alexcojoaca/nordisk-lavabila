import type { APIRoute } from "astro";
import { readSigned, redirectTo } from "../../../lib/auth";
import { digits, findSubscriber, updateProfile } from "../../../lib/store";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const id = readSigned(cookies.get("nordisk_member")?.value);
  const subscriber = id ? await findSubscriber(id) : null;
  if (!subscriber) return redirectTo(request, "/blue-card");

  const form = await request.formData();
  const firstName = String(form.get("firstName") || "").trim();
  const lastName = String(form.get("lastName") || "").trim();
  const phone = String(form.get("phone") || "").trim();
  const phoneKey = digits(phone);

  if (firstName.length < 2 || lastName.length < 2 || phoneKey.length < 8) {
    return redirectTo(request, "/blue-card/cont/profil?eroare=profil");
  }

  const saved = await updateProfile(subscriber.id, { firstName, lastName, phone, phoneKey }).catch(() => undefined);
  if (!saved) return redirectTo(request, "/blue-card/cont/profil?eroare=telefon");
  return redirectTo(request, "/blue-card/cont/profil?salvat=1");
};
