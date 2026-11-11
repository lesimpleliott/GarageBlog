import { auth } from "@/server/auth";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";

/**
 * Crée un compte utilisateur, directement dans la base.
 *
 * Ce script est la seule porte d'entrée et sert avant tout à créer le premier super-admin.
 * L'inscription publique étant fermée (`disableSignUp` dans `src/server/auth/index.ts`) : sur une base vide,
 * aucun compte n'existe et personne ne peut en créer depuis le site.
 *
 * Lancement : `npm run user:create`, depuis la machine d'un développeur. Il écrit
 * dans la base indiquée par `DATABASE_URL` (Docker en local, o2switch en ligne).
 */
async function main() {
  // Pose les questions dans le terminal
  const rl = createInterface({ input, output });
  const name = (await rl.question("Nom : ")).trim();
  const email = (await rl.question("E-mail : ")).trim().toLowerCase();
  const password = await rl.question("Mot de passe : ");
  rl.close();

  if (!name || !email || password.length < 8) {
    throw new Error(
      "Nom, e-mail et mot de passe d'au moins 8 caractères obligatoires.",
    );
  }

  // La « porte de service » de Better Auth
  const ctx = await auth.$context;

  if (await ctx.internalAdapter.findUserByEmail(email)) {
    throw new Error("Un compte existe déjà avec cet e-mail.");
  }

  // Le hash est fait par Better Auth, comme à l'inscription
  const hash = await ctx.password.hash(password);

  // `method: "admin"` : compte créé par un administrateur, comme le plugin admin de Better Auth
  const user = await ctx.internalAdapter.createUser(
    { name, email, emailVerified: true },
    { method: "admin" },
  );

  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: hash,
  });

  console.log(`Compte créé : ${user.email}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
