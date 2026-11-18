"use client";

import Tooltip from "@/components/Tooltip";
import { sendAccessLink } from "@/server/users/actions";
import type { UserStatus } from "@/utils/userStatus";
import {
  faArrowRotateLeft,
  faCheck,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useTransition } from "react";

type SendAccessLinkButtonProps = {
  userId: string;
  userName: string;
  status: UserStatus;
};

// Le texte du bouton (lu par les lecteurs d'écran) selon le statut du compte
const LABELS: Record<UserStatus, string> = {
  invited: "Renvoyer l'invitation à",
  active: "Envoyer un lien de réinitialisation à",
  banned: "Réactiver et envoyer un lien à",
};

/**
 * Bouton d'envoi d'un lien d'accès, dans la colonne « Actions » du tableau `/users`.
 * Appelle `sendAccessLink` : le serveur choisit l'e-mail (invitation ou réinitialisation) d'après la base.
 *  - Compte désactivé : demande confirmation avec `window.confirm`, puis demande au serveur de le réactiver avant l'envoi.
 *  - Affiche une coche après l'envoi (bouton bloqué, contre un double envoi) ou une alerte en cas d'erreur (on peut recliquer).
 *
 * @param userId - l'id du compte visé
 * @param userName - le nom du compte, pour le libellé lu par les lecteurs d'écran et le message de confirmation
 * @param status - le statut du compte (voir `getUserStatus`), qui choisit le libellé et déclenche la confirmation
 */
export default function SendAccessLinkButton({
  userId,
  userName,
  status,
}: SendAccessLinkButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<"idle" | "sent" | "error">("idle");

  function handleClick() {
    if (
      status === "banned" &&
      !window.confirm(
        `Le compte de ${userName} est désactivé. Le réactiver et lui envoyer un lien d’accès ?`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        await sendAccessLink(userId, { unban: status === "banned" });
        setResult("sent");
      } catch {
        setResult("error");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending || result === "sent"} // Empêche un double envoi
      aria-label={`${LABELS[status]} ${userName}`}
      className="cursor-pointer transition-all hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Tooltip content={`${LABELS[status]} "${userName}"`} position="left">
        {result === "sent" ? (
          // Lien envoyé
          <FontAwesomeIcon icon={faCheck} className="text-green-500" />
        ) : result === "error" ? (
          // Erreur lors de l'envoi du lien
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className="text-red-500"
          />
        ) : (
          // Bouton d'envoi
          <FontAwesomeIcon
            icon={faArrowRotateLeft}
            className="transition-all hover:-rotate-45 hover:text-foreground"
          />
        )}
      </Tooltip>
    </button>
  );
}
