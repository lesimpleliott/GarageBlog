"use client";

import { isRole, ROLE_LABELS } from "@/utils/roles";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { useState } from "react";

type RoleSelectProps = {
  userRole: string;
  userName: string;
  action: (formData: FormData) => Promise<void>;
};

/**
 * Liste déroulante pour changer le rôle d'un compte, dans le tableau `/admin/users`.
 * Tant que le rôle choisi diffère du rôle enregistré, la liste passe en rouge et le bouton d'enregistrement apparaît.
 *
 * Dans la page, le composant doit avoir `key={user.role}` : il est ainsi recréé après chaque enregistrement, et repart du nouveau rôle (état compris).
 * Un rôle enregistré mais absent du code (ex. supprimé depuis) apparaît comme option désactivée, pour ne pas afficher à tort le premier rôle de la liste.
 *
 * @param userRole - le rôle enregistré en base
 * @param userName - le nom du compte, pour les libellés lus par les lecteurs d'écran
 * @param action - `setUserRole`, avec l'id du compte fixé par `.bind`
 */
export default function RoleSelect({
  userRole,
  userName,
  action,
}: RoleSelectProps) {
  const [currentRole, setCurrentRole] = useState(userRole);
  const isDirty = currentRole !== userRole;
  const isUnknownRole = !isRole(userRole);

  return (
    <form action={action} className="ml-8 flex items-center justify-center">
      <select
        name="role"
        aria-label={`Rôle de ${userName}`}
        defaultValue={userRole}
        onChange={(e) => setCurrentRole(e.target.value)}
        className={clsx(isDirty && "text-red-700 italic")}
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

      <button
        type="submit"
        aria-label={`Enregistrer le rôle de ${userName}`}
        className={clsx(
          isDirty ? "opacity-100" : "opacity-0",
          "text-red-700 transition-colors hover:text-red-800",
          "cursor-pointer",
        )}
      >
        <FontAwesomeIcon icon={faSave} />
      </button>
    </form>
  );
}
