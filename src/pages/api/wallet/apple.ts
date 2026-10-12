import type { APIRoute } from "astro";
import { readSigned } from "../../../lib/auth";
import { findSubscriber } from "../../../lib/store";

export const prerender = false;

export const GET: APIRoute = async ({ cookies, redirect }) => {
  const id = readSigned(cookies.get("nordisk_member")?.value);
  const subscriber = id ? await findSubscriber(id) : null;
  if (!subscriber) return redirect("/blue-card");
  return redirect("/blue-card/cont?portofel=1");
};
