/*
 * Les rôles du site, utilisables partout (serveur et composants client).
 * La source unique est l'objet `roles` de `@/server/auth/permissions` : tout le reste en est déduit.
 * Pour ajouter un rôle : le déclarer dans `roles` avec ses droits, puis lui donner un libellé ici.
 */

import type { roles } from "@/server/auth/permissions";
export type Role = keyof typeof roles;

/** Le nom affiché `label` de chaque rôle.*/
export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  author: "Auteur",
};

/**
 * Vérifie qu'une valeur est un rôle connu, par exemple ce qui arrive d'un formulaire.
 * @param value - la valeur à vérifier, de n'importe quel type
 * @returns `true` si c'est un rôle déclaré, `false` sinon
 */
export function isRole(value: unknown): value is Role {
  return typeof value === "string" && Object.hasOwn(ROLE_LABELS, value);
}
