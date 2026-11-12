import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

// La liste de toutes les actions possibles sur les comptes et les sessions, fournie par le plugin admin
// `ac` = Access Control
const ac = createAccessControl(defaultStatements);

/**
 * Les rôles du site, et ce que chacun peut faire sur les comptes.
 * Les droits sur les articles ne sont pas ici : ils sont vérifiés dans les actions des articles.
 */
export const roles = {
  // Droits d'un compte `admin`
  admin: ac.newRole({
    user: [
      "create",
      "list",
      "set-role",
      "ban",
      "delete",
      "set-password",
      "set-email",
      "set-phone",
      "get",
      "update",
      // "impersonate" // "se faire passer pour" existe par défaut mais n'est pas utilisé ici
    ],
    session: ["list", "revoke", "delete"],
  }),
  // Droits d'un compte `author`
  author: ac.newRole({
    user: [],
    session: [],
  }),
};
