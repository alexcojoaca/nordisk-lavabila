import type { APIRoute } from "astro";
import { checkPassword, hashPassword, readSigned, redirectTo } from "../../../lib/auth";
import { findSubscriber, updatePassword } from "../../../lib/store";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const id = readSigned(cookies.get("nordisk_member")?.value);
  const subscriber = id ? await findSubscriber(id) : null;
  if (!subscriber) return redirectTo(request, "/blue-card");

  const form = await request.formData();
  const current = String(form.get("current") || "");
  const next = String(form.get("next") || "");

  if (!checkPassword(current, subscriber.passwordHash) || next.length < 6) {
    return redirectTo(request, "/blue-card/cont/parola?eroare=parola");
  }

  const saved = await updatePassword(subscriber.id, hashPassword(next)).catch(() => null);
  if (!saved) return redirectTo(request, "/blue-card/cont/parola?eroare=parola");
  return redirectTo(request, "/blue-card/cont/parola?salvat=1");
};
