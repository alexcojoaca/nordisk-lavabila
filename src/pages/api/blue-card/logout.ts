import type { APIRoute } from "astro";
import { redirectTo } from "../../../lib/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  return redirectTo(request, "/blue-card", { clear: "nordisk_member" });
};
