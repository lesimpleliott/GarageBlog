"use client";

import {
  forgotPassword,
  type ForgotPasswordFormState,
} from "@/server/auth/actions";
import clsx from "clsx";
import { useActionState } from "react";

// Réponse de départ, vide : le serveur n'a encore rien répondu
const initialState: ForgotPasswordFormState = {};

/**
 * Formulaire de mot de passe oublié : demande l'envoi d'un lien de réinitialisation par e-mail.
 * Une fois envoyé, il laisse la place au même message, que le compte existe ou non (voir `forgotPassword`).
 */
export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    forgotPassword,
    initialState,
  );

  return state.sent ? (
    <p role="status" className="mt-4">
      Si un compte existe avec cette adresse, vous allez recevoir un e-mail avec
      un lien pour choisir un nouveau mot de passe. <br />
      Pensez à vérifier vos spams.
    </p>
  ) : (
    <form action={formAction} className="mt-4 flex max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1">
        E-mail
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded border bg-foreground-secondary/10 px-2 py-1"
        />
      </label>

      <button
        type="submit"
        className={clsx(
          "cursor-pointer self-start rounded border px-3 py-1",
          "transition-colors hover:bg-foreground-secondary",
          "disabled:cursor-not-allowed disabled:text-foreground-secondary disabled:italic",
        )}
        disabled={pending}
      >
        {pending ? "Envoi..." : "Envoyer le lien"}
      </button>
    </form>
  );
}
