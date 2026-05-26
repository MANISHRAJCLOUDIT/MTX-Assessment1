import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Hardcoded to match your repository name for GitHub Pages
  base: "/MTX-Assessment1/", 
});