"use client";

import { isRole, ROLE_LABELS } from "@/utils/userRoles";
import type { ChangeEvent } from "react";

type RoleSelectProps = {
  userRole: string;
  userName: string;
  action: (formData: FormData) => Promise<void>;
};

/**
 * Liste déroulante pour changer le rôle d'un compte, dans le tableau `/users`.
 * Chaque choix demande confirmation (`window.confirm`) : validé, il est enregistré aussitôt ; annulé, la liste revient au rôle enregistré.
 *
 * Dans la page, le composant doit avoir `key={user.role}` : il est ainsi recréé après chaque enregistrement, et repart du nouveau rôle.
 * Un rôle enregistré mais absent du code (ex. supprimé depuis) apparaît comme option désactivée, pour ne pas afficher à tort le premier rôle de la liste.
 *
 * @param userRole - le rôle enregistré en base
 * @param userName - le nom du compte, pour le libellé lu par les lecteurs d'écran et le message de confirmation
 * @param action - `setUserRole`, avec l'id du compte fixé par `.bind`
 */
export default function RoleSelect({
  userRole,
  userName,
  action,
}: RoleSelectProps) {
  const isUnknownRole = !isRole(userRole);

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const select = e.currentTarget;
    const newLabel = isRole(select.value)
      ? ROLE_LABELS[select.value]
      : select.value;

    if (!window.confirm(`Passer ${userName} en « ${newLabel} » ?`)) {
      select.value = userRole; // Annulé : la liste revient au rôle enregistré
      return;
    }

    // Validé : envoie le formulaire, comme un clic sur un bouton « Envoyer » (avec la transition automatique du `<form action>`)
    select.form?.requestSubmit();
  }

  return (
    <form action={action} className="flex justify-center">
      <select
        name="role"
        aria-label={`Rôle de ${userName}`}
        defaultValue={userRole}
        onChange={handleChange}
        className="cursor-pointer"
      >
        {/* Affichage du rôle s'il est inconnu/supprimé */}
        {isUnknownRole && (
          <option value={userRole} disabled>
            {userRole} (inconnu)
          </option>
        )}

        {/* Affichage des rôles disponibles */}
        {Object.entries(ROLE_LABELS).map(([role, label]) => (
          <option key={role} value={role}>
            {label}
          </option>
        ))}
      </select>
    </form>
  );
}
