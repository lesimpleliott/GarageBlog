"use client";

import { signIn, type SignInFormState } from "@/server/auth/actions";
import { useActionState } from "react";

const initialState: SignInFormState = {};

/** Formulaire de connexion par e-mail et mot de passe. */
export default function SignInForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="mt-4 flex max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1">
        E-mail
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          defaultValue={state.email}
          className="rounded border bg-foreground-secondary/10 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1">
        Mot de passe
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="rounded border bg-foreground-secondary/10 px-2 py-1"
        />
      </label>

      <div className="mt-2 flex flex-row items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer self-start rounded border px-3 py-1 disabled:cursor-not-allowed disabled:italic"
        >
          {pending ? "Connexion…" : "Se connecter"}
        </button>

        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      </div>
    </form>
  );
}
