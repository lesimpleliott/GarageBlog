"use client";

import { deleteUser } from "@/server/users/actions";
import {
  faArrowsRotate,
  faTrash,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useTransition } from "react";

type DeleteUserButtonProps = {
  userId: string;
  userName: string;
};

/**
 * Bouton de suppression d'un compte, dans la colonne « Actions » du tableau `/users`.
 * Demande confirmation avec `window.confirm`, puis appelle `deleteUser` : le compte et tous ses articles sont supprimés.
 * En cas de succès, la ligne disparaît du tableau (`revalidatePath`) ; en cas d'échec, une icône d'alerte s'affiche.
 *
 * @param userId - l'id du compte visé
 * @param userName - le nom du compte, pour le message de confirmation
 */
export default function DeleteUserButton({
  userId,
  userName,
}: DeleteUserButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (
      !window.confirm(
        `Supprimer le compte de ${userName} ?\n\nTous ses articles seront aussi supprimés.\nCette action est irréversible.`,
      )
    ) {
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await deleteUser(userId);
      } catch {
        setError("Échec de la suppression");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      title={error !== null ? error : `Supprimer le compte "${userName}"`}
      aria-label={`Supprimer le compte de ${userName}`}
      className="cursor-pointer transition-all hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {error !== null ? (
        <FontAwesomeIcon
          icon={faTriangleExclamation}
          className="text-red-500"
        />
      ) : isPending ? (
        <FontAwesomeIcon icon={faArrowsRotate} spin />
      ) : (
        <FontAwesomeIcon
          icon={faTrash}
          className="transition-colors hover:text-red-500"
        />
      )}
    </button>
  );
}
