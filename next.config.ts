import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // PGlite (Postgres en WebAssembly) no s'ha d'empaquetar: es carrega tal qual des de node_modules
  serverExternalPackages: ["@electric-sql/pglite"],
  experimental: {
    // Pujada de fotos des de l'admin. El navegador ja les redueix (< 1 MB); límit per si de cas.
    // (Vercel no accepta peticions de més de 4,5 MB.)
    serverActions: { bodySizeLimit: "4mb" },
  },
  images: {
    // Només WebP: l'AVIF pesa una mica menys però és molt lent de generar el primer cop
    formats: ["image/webp"],
    // Les imatges optimitzades es guarden 31 dies a la memòria cau de Vercel.
    // (Per defecte són 60 s: després d'unes hores sense visites calia tornar-les a processar totes.)
    minimumCacheTTL: 60 * 60 * 24 * 31,
    // Menys mides possibles → menys variants a generar i més encerts de memòria cau
    deviceSizes: [640, 828, 1080, 1200],
    imageSizes: [64, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Obliga a fer servir sempre HTTPS (2 anys)
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // Fotos i logo: 1 dia a la memòria cau, i fins a 30 dies servint la còpia mentre es renova
        source: "/img/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=2592000" }],
      },
    ];
  },
};

export default nextConfig;
