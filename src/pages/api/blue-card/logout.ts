import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  cookies.delete("nordisk_member", { path: "/" });
  return Response.redirect(new URL("/blue-card", request.url), 303);
};
