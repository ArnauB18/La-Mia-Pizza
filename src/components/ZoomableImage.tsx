"use client";

/**
 * Embolcall que fa zoom a la imatge seguint el ratolí (efecte "lupa").
 * Al mòbil no fa res: l'efecte només s'activa amb ratolí (vegeu `.zoomable` a globals.css).
 */
export function ZoomableImage({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`zoomable overflow-hidden ${className}`}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--zx", `${((e.clientX - r.left) / r.width) * 100}%`);
        e.currentTarget.style.setProperty("--zy", `${((e.clientY - r.top) / r.height) * 100}%`);
      }}
    >
      {children}
    </div>
  );
}
