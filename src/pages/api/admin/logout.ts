import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  cookies.delete("nordisk_admin", { path: "/" });
  return Response.redirect(new URL("/admin", request.url), 303);
};
