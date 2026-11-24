"use client";

import { faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { FormEvent } from "react";

type UnpublishArticleButtonProps = {
  action: () => Promise<void>;
  needsConfirm: boolean;
};

/** Bouton permettant de repasser un article en brouillon,
 * - avec une confirmation si l'article est `publié`.
 * - sans confirmation si l'article est `programmé`. */
export default function UnpublishArticleButton({
  action,
  needsConfirm,
}: UnpublishArticleButtonProps) {
  // Annule si l'utilisateur refuse la confirmation
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (
      needsConfirm &&
      !confirm(
        "Souhaitez-vous vraiment repasser l'article en brouillon ?\nIl ne sera plus visible par les visiteurs.",
      )
    ) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <button
        type="submit"
        className="cursor-pointer transition-colors hover:text-foreground-secondary"
      >
        <FontAwesomeIcon icon={faPen} /> Repasser en brouillon
      </button>
    </form>
  );
}
