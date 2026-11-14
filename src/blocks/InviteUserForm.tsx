"use client";

import { inviteUser, type InviteUserFormState } from "@/server/users/actions";
import { ROLE_LABELS } from "@/utils/roles";
import clsx from "clsx";
import { useActionState, useEffect, useState } from "react";

// Réponse de départ, vide : le serveur n'a encore rien répondu
const initialState: InviteUserFormState = {};

/**
 * Formulaire d'invitation, en haut de `/admin/users` : nom, e-mail et rôle de la personne à inviter.
 * `inviteUser` crée le compte sans mot de passe et envoie l'e-mail d'invitation.
 *
 * Après un succès, le bouton passe au vert (« Invitation envoyée ! ») quelques secondes,
 * puis redevient neuf pour enchaîner une autre invitation. Les champs, eux, se vident aussitôt.
 */
export default function InviteUserForm() {
  const [state, formAction, pending] = useActionState(inviteUser, initialState);

  // La dernière réponse dont le succès a fini d'être affiché.
  // Chaque envoi produit un nouvel objet `state` : une nouvelle invitation a donc son propre délai
  const [expiredState, setExpiredState] = useState<InviteUserFormState | null>(
    null,
  );

  // Vert seulement pour une réponse réussie dont le délai n'est pas écoulé
  const showSent = state.sent && state !== expiredState;

  // Minuteur : à chaque réponse réussie, marque cette réponse comme « expirée » après le délai.
  // L'état ne change que dans le minuteur, jamais directement dans l'effet (règle `react-hooks/set-state-in-effect`)
  useEffect(() => {
    if (!state.sent) return; // Rien à minuter si ce n'est pas un succès

    const timer = setTimeout(() => setExpiredState(state), 3000);
    return () => clearTimeout(timer); // Annule le minuteur si une nouvelle réponse arrive avant
  }, [state]);

  return (
    <form
      action={formAction}
      className="mt-4 grid grid-cols-4 items-end gap-x-6"
    >
      <label className="flex flex-col gap-1">
        Nom
        <input
          type="text"
          name="name"
          defaultValue={state.name} // Garde la saisie après une erreur (React vide le formulaire après chaque envoi)
          required
          className="h-9 rounded border bg-foreground-secondary/10 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1">
        E-mail
        <input
          type="email"
          name="email"
          defaultValue={state.email} // Garde la saisie après une erreur (React vide le formulaire après chaque envoi)
          required
          className="h-9 rounded border bg-foreground-secondary/10 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1">
        Rôle
        <select
          name="role"
          defaultValue="author"
          className="h-9 rounded border bg-foreground-secondary/10 px-2 py-1"
        >
          {Object.entries(ROLE_LABELS).map(([role, label]) => (
            <option key={role} value={role}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={pending}
        className={clsx(
          "h-9 px-3 py-1",
          "cursor-pointer rounded border transition-colors",
          showSent
            ? "bg-green-500 font-medium text-green-800"
            : "bg-foreground-secondary/50 hover:bg-foreground-secondary/10",
          "disabled:cursor-not-allowed disabled:italic",
        )}
      >
        {pending ? "Envoi…" : showSent ? "Invitation envoyée !" : "Inviter"}
      </button>

      {/* pour les lecteurs d'écran */}
      <p role="status" className="sr-only">
        {state.sent && "Invitation envoyée."}
      </p>

      {/* Affichage Erreur */}
      <p role="alert" className="col-span-4 mt-2 text-sm text-red-600">
        {state.error}
      </p>
    </form>
  );
}
