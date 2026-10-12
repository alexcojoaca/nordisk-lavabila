import type { APIRoute } from "astro";
import { checkPassword, hashPassword, readSigned } from "../../../lib/auth";
import { findSubscriber, updatePassword } from "../../../lib/store";

export const prerender = false;

function go(request: Request, path: string) {
  return Response.redirect(new URL(path, request.url), 303);
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const id = readSigned(cookies.get("nordisk_member")?.value);
  const subscriber = id ? await findSubscriber(id) : null;
  if (!subscriber) return go(request, "/blue-card");

  const form = await request.formData();
  const current = String(form.get("current") || "");
  const next = String(form.get("next") || "");

  if (!checkPassword(current, subscriber.passwordHash) || next.length < 6) {
    return go(request, "/blue-card/cont?eroare=parola#parola");
  }

  const saved = await updatePassword(subscriber.id, hashPassword(next)).catch(() => null);
  if (!saved) return go(request, "/blue-card/cont?eroare=parola#parola");
  return go(request, "/blue-card/cont?salvat=parola#parola");
};
