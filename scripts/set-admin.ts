import { auth } from "@/server/auth";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";

/**
 * Donne le rôle `admin` à un compte existant, directement dans la base.
 *
 * Outil de secours du développeur : il sert à nommer un administrateur quand personne ne l'est (premier admin, ou plus aucun admin).
 * Depuis le site, seul un admin connecté peut changer un rôle : sans admin, personne ne le peut, d'où ce script.
 * Les autres changements de rôle se font depuis l'espace admin du site.
 *
 * Lancement : `npm run user:set-admin`, depuis la machine d'un développeur. Il écrit
 * dans la base indiquée par `DATABASE_URL` (Docker en local, o2switch en ligne).
 */
async function main() {
  // Pose la question dans le terminal
  const rl = createInterface({ input, output });
  const email = (await rl.question("E-mail : ")).trim().toLowerCase();
  rl.close();

  // La « porte de service » de Better Auth
  const ctx = await auth.$context;

  const found = await ctx.internalAdapter.findUserByEmail(email);
  if (!found) {
    throw new Error("Aucun compte avec cet e-mail.");
  }

  await ctx.internalAdapter.updateUser(found.user.id, { role: "admin" });

  console.log(`${found.user.email} est maintenant admin.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
