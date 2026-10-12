import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";

export default defineConfig({
  site: "https://nordisk-lavabila.vercel.app",
  output: "server",
  adapter: vercel(),
  security: {
    checkOrigin: false,
  },
});
