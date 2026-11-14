import { roles } from "@/server/auth/permissions";
import { db } from "@/server/db";
import * as authSchema from "@/server/db/schema/auth";
import { sendEmail } from "@/server/email/send";
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
    // Appelée par Better Auth quand quelqu'un demande à réinitialiser son mot de passe.
    // `url` est le lien à usage unique, valable 1 heure, qui mène à `/reset-password`
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Réinitialisation de votre mot de passe Garage Blog",
        text: [
          `Bonjour ${user.name},`,
          "",
          "Vous avez demandé à réinitialiser le mot de passe de votre compte Garage Blog.",
          "Pour en choisir un nouveau, suivez ce lien :",
          "",
          url,
          "",
          "Ce lien est personnel, ne fonctionne qu'une fois et reste valable 1 heure.",
          "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message : votre mot de passe actuel reste inchangé.",
          "",
          "À bientôt sur Garage Blog,",
          "L'équipe Garage Blog",
          "",
          "--",
          "Cet e-mail a été envoyé automatiquement, merci de ne pas y répondre.",
        ].join("\n"),
      });
    },
    revokeSessionsOnPasswordReset: true, // Déconnecte toutes les sessions du compte après un changement de mot de passe
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
