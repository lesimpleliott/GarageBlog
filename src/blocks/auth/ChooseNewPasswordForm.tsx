"use client";

import {
  chooseNewPassword,
  type ChooseNewPasswordFormState,
} from "@/server/auth/actions";
import { useActionState } from "react";

// Réponse de départ, vide : le serveur n'a encore rien répondu
const initialState: ChooseNewPasswordFormState = {};

/**
 * Formulaire de choix d'un nouveau mot de passe, sur la page `/reset-password` (lien reçu par e-mail).
 * Le mot de passe est saisi deux fois ; les contrôles (identiques, 8 caractères minimum, lien valide)
 * sont faits côté serveur par `chooseNewPassword`, qui renvoie vers `/login` en cas de succès.
 *
 * @param token - le jeton de réinitialisation lu dans l'adresse par la page
 */
export default function ChooseNewPasswordForm({ token }: { token: string }) {
  // `.bind` fixe le jeton en premier argument : l'action reçoit (token, prevState, formData)
  const [state, formAction, pending] = useActionState(
    chooseNewPassword.bind(null, token),
    initialState,
  );

  return (
    <form action={formAction} className="mt-4 flex max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1">
        Nouveau mot de passe
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="rounded border bg-foreground-secondary/10 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1">
        Confirmer le nouveau mot de passe
        <input
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          required
          className="rounded border bg-foreground-secondary/10 px-2 py-1"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer self-start rounded border px-3 py-1 disabled:cursor-not-allowed disabled:italic"
      >
        {pending ? "Validation…" : "Valider"}
      </button>

      {/* Affichage Erreur */}
      <p role="alert" className="text-sm text-red-600">
        {state.error}
      </p>
    </form>
  );
}
