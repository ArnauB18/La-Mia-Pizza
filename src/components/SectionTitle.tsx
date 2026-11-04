/**
 * Títol de secció amb un subratllat "fet a mà" que es dibuixa en aparèixer.
 * Lliga amb la lletra manuscrita del logo sense afegir colors nous.
 */
export function SectionTitle({
  children,
  id,
  as: Tag = "h2",
  className = "text-4xl",
}: {
  children: React.ReactNode;
  id?: string;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <Tag id={id} className={`font-display leading-none ${className}`}>
      <span className="relative inline-block pb-2">
        {children}
        <svg
          viewBox="0 0 200 12"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute -bottom-0.5 left-0 h-2.5 w-full text-ink/80"
        >
          <path
            d="M2 8 C 40 2, 70 11, 105 6 S 170 3, 198 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="animate-draw"
          />
        </svg>
      </span>
    </Tag>
  );
}
