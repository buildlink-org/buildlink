import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const marker = "node_modules/";
          const idx = id.lastIndexOf(marker);
          if (idx === -1) return;

          const rest = id.slice(idx + marker.length);
          const segments = rest.split("/");
          const pkg = segments[0].startsWith("@") ? `${segments[0]}/${segments[1]}` : segments[0];

          if (pkg === "@supabase/supabase-js" || pkg === "@supabase") return "vendor-supabase";
          if (pkg.startsWith("@radix-ui")) return "vendor-radix";
          if (pkg.startsWith("@tanstack")) return "vendor-query";
          if (pkg === "recharts" || pkg.startsWith("d3-")) return "vendor-charts";
          if (pkg === "react-router-dom" || pkg === "react-router") return "vendor-router";
          if (pkg === "react" || pkg === "react-dom" || pkg === "scheduler") return "vendor-react";
          return "vendor";
        },
      },
    },
  }
});