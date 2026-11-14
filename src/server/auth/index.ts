import { roles } from "@/server/auth/permissions";
import { db } from "@/server/db";
import * as authSchema from "@/server/db/schema/auth";
import { sendEmail } from "@/server/email/send";
import { invitationEmail, resetPasswordEmail } from "@/server/email/templates";
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
    revokeSessionsOnPasswordReset: true, // Déconnecte toutes les sessions du compte après un changement de mot de passe
    resetPasswordTokenExpiresIn: 60 * 60 * 24, // 60s * 60min * 24h = 24 heures, pour le mot de passe oublié et l'invitation
    sendResetPassword: async ({ user, url }) => {
      // Détermine s'il s'agit d'une invitation `?invite=1` ou d'une réinitialisation
      const callbackURL = new URL(url).searchParams.get("callbackURL");
      const isInvitation = callbackURL === "/reset-password?invite=1";

      await sendEmail({
        to: user.email,
        ...(isInvitation
          ? invitationEmail({ name: user.name, url }) // Envoie le mail d'invitation
          : resetPasswordEmail({ name: user.name, url })), // Envoie le mail de réinitialisation
      });
    },
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
