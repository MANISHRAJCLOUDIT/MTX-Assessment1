import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // When deploying to a GitHub Pages project subpath (e.g. /MTX-Assessment/),
  // set VITE_PUBLIC_PATH at build time to ensure assets resolve correctly.
  base: process.env.VITE_PUBLIC_PATH ?? "/",
});
