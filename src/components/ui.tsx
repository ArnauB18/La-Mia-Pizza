/**
 * Peces de formulari reutilitzables, amb l'estil de la web.
 * Cada camp mostra el seu error a sota i el marca per a lectors de pantalla.
 */
import { forwardRef } from "react";

const fieldBase =
  "w-full rounded-xl border bg-card px-3.5 py-3 text-base text-ink shadow-sm outline-none transition placeholder:text-ink-soft/60 focus-visible:outline-none focus:border-ink focus:ring-2 focus:ring-ink/15";

export function Field({
  label,
  htmlFor,
  error,
  help,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  error?: string;
  help?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="animate-fade-up mt-1.5 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : (
        help && <p className="mt-1.5 text-xs text-ink-soft">{help}</p>
      )}
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ invalid, className = "", ...props }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && props.id ? `${props.id}-error` : undefined}
      className={`${fieldBase} ${invalid ? "border-red-600 bg-red-50/60" : "border-line"} ${className}`}
      {...props}
    />
  );
});

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export function Textarea({ invalid, className = "", ...props }: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={`${fieldBase} min-h-20 resize-y ${invalid ? "border-red-600" : "border-line"} ${className}`}
      {...props}
    />
  );
}

export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`animate-spin ${className}`} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Capçalera numerada de cada pas del procés de comanda. */
export function StepHeader({ n, title, done = false }: { n: number; title: string; done?: boolean }) {
  return (
    <h2 className="mb-4 flex items-center gap-3 font-display text-3xl leading-none">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-display text-xl leading-none transition ${
          done ? "border-basil bg-basil text-white" : "border-ink"
        }`}
        aria-hidden="true"
      >
        {done ? "✓" : n}
      </span>
      {title}
    </h2>
  );
}
