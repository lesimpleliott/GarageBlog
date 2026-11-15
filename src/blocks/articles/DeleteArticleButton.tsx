"use client";

import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { FormEvent } from "react";

type DeleteArticleButtonProps = {
  action: () => Promise<void>;
};

/** Bouton de suppression d'article, avec une confirmation avant l'envoi. */
export default function DeleteArticleButton({
  action,
}: DeleteArticleButtonProps) {
  // Annule l'envoi si l'utilisateur refuse la confirmation
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!confirm("Supprimer définitivement cet article ?")) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <button
        type="submit"
        className="cursor-pointer transition-colors hover:text-red-600"
      >
        <FontAwesomeIcon icon={faTrash} /> Supprimer
      </button>
    </form>
  );
}
