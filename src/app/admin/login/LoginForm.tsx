"use client";

import { useActionState } from "react";
import { login } from "../actions";
import { Field, Input, Spinner } from "@/components/ui";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="space-y-4">
      <Field label="Contrasenya" htmlFor="password" error={state?.error}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required autoFocus invalid={Boolean(state?.error)} />
      </Field>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {pending && <Spinner />} Entrar
      </button>
    </form>
  );
}
