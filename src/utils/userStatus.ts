import { PillTone } from "@/components/Pill";

// CONFIG / TYPE DE STATUT
/** Les statuts possibles d'un compte, déduits de la base : rien n'est stocké sous ce nom. */
export type UserStatus = "active" | "invited" | "banned";

/** Le libellé et la couleur de pastille de chaque statut. */
export const USER_STATUS: Record<
  UserStatus,
  { label: string; tone: PillTone }
> = {
  active: { label: "Actif", tone: "green" },
  invited: { label: "Invité", tone: "orange" },
  banned: { label: "Désactivé", tone: "red" },
};

/**
 * Déduit le statut d'un compte. Un compte désactivé reste « Désactivé », même s'il n'a pas encore de mot de passe.
 *
 * @param isBanned - le compte a été désactivé par un admin (`user.banned`)
 * @param hasPassword - le compte a choisi son mot de passe (voir `getUserIdsWithPassword`)
 * @returns `banned`, sinon `invited` sans mot de passe, sinon `active`
 */
export function getUserStatus(
  isBanned: boolean,
  hasPassword: boolean,
): UserStatus {
  return isBanned ? "banned" : !hasPassword ? "invited" : "active";
}
