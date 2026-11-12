import { roles } from "@/server/auth/permissions";
import { db } from "@/server/db";
import * as authSchema from "@/server/db/schema/auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

/** Authentification du site : comptes, connexion et sessions. */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  plugins: [
    admin({
      roles,
      defaultRole: "author", // Rôle donné à tout nouveau compte
      adminRoles: ["admin"], // Rôles qui ont accès aux guichets admin
    }), // Rôles et gestion des comptes
    nextCookies(), // Pose le cookie de session depuis les Server Actions. Toujours en dernier
  ],
});
