/*
 * Les textes des e-mails du site : chaque gabarit reçoit ce qui varie (nom, lien)
 * et renvoie le sujet et le texte, à étaler dans `sendEmail` : `sendEmail({ to, ...gabarit })`.
 */

/**
 * E-mail de mot de passe oublié, envoyé quand quelqu'un le demande sur `/forgot-password`.
 *
 * @param name - le nom du compte
 * @param url - le lien de réinitialisation à usage unique, fourni par Better Auth
 * @returns le sujet et le texte de l'e-mail
 */
export function resetPasswordEmail({
  name,
  url,
}: {
  name: string;
  url: string;
}) {
  return {
    subject: "Réinitialisation de votre mot de passe Garage Blog",
    text: [
      `Bonjour ${name},`,
      "",
      "Vous avez demandé à réinitialiser le mot de passe de votre compte Garage Blog.",
      "Pour en choisir un nouveau, suivez ce lien :",
      "",
      url,
      "",
      "Ce lien est personnel, ne fonctionne qu'une fois et reste valable 24 heures.",
      "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message : votre mot de passe actuel reste inchangé.",
      "",
      "À bientôt sur Garage Blog,",
      "L'équipe Garage Blog",
      "",
      "--",
      "Cet e-mail a été envoyé automatiquement, merci de ne pas y répondre.",
    ].join("\n"),
  };
}

/**
 * E-mail d'invitation, envoyé quand un admin crée un compte : la personne y choisit son premier mot de passe.
 * Il passe par le même mécanisme que le mot de passe oublié (lien vers `/reset-password`).
 *
 * @param name - le nom du compte
 * @param url - le lien de réinitialisation à usage unique, fourni par Better Auth
 * @returns le sujet et le texte de l'e-mail
 */
export function invitationEmail({ name, url }: { name: string; url: string }) {
  return {
    subject: "Votre invitation à rejoindre Garage Blog",
    text: [
      `Bonjour ${name},`,
      "",
      "Un administrateur de Garage Blog vient de vous créer un compte.",
      "Pour l'activer, choisissez votre mot de passe en suivant ce lien :",
      "",
      url,
      "",
      "Ce lien est personnel, ne fonctionne qu'une fois et reste valable 24 heures.",
      "Passé ce délai, demandez à l'administrateur de vous renvoyer une invitation.",
      "Si vous n'attendiez pas cette invitation, ignorez simplement ce message : le compte restera inactif.",
      "",
      "À bientôt sur Garage Blog,",
      "L'équipe Garage Blog",
      "",
      "--",
      "Cet e-mail a été envoyé automatiquement, merci de ne pas y répondre.",
    ].join("\n"),
  };
}
