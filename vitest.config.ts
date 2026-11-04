import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // "server-only" falla fora de Next: a les proves el substituïm per un mòdul buit
      "server-only": path.resolve(__dirname, "tests/server-only-stub.ts"),
    },
  },
  test: {
    environment: "node",
    // Base de dades en memòria per a les proves (mai toca ./.data)
    env: { VERCEL: "1", DATABASE_URL: "" },
  },
});
