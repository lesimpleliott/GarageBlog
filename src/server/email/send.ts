import nodemailer from "nodemailer";

type Email = {
  to: string; // L'adresse du destinataire
  subject: string; // Le sujet
  text: string; // Le contenu, en texte brut
};

/**
 * La connexion au serveur SMTP d'o2switch, créée une seule fois pour tout le site.
 * Rien n'est envoyé ni connecté à sa création : la connexion n'a lieu qu'au premier `sendMail`.
 * Les variables `SMTP_*` sont nécessaires qu'en production.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT), // Une variable d'environnement est toujours une chaîne
  secure: true, // Le port 465 chiffre la connexion dès le départ
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Envoie un e-mail depuis l'adresse `EMAIL_FROM`.
 * Hors production, rien n'est envoyé : l'e-mail est seulement affiché dans le terminal (liens compris).
 *
 * WARNING : Fonction interne au serveur.
 * Ne jamais ajouter `"use server"` à ce fichier, ni la ré-exporter depuis un fichier qui l'a : n'importe qui pourrait alors envoyer des e-mails depuis le navigateur.
 *
 * @param email - le destinataire, le sujet et le texte de l'e-mail
 */
export async function sendEmail({ to, subject, text }: Email) {
  // En local : on affiche la lettre dans le terminal, sans rien envoyer
  if (process.env.NODE_ENV !== "production") {
    console.log({ to, subject, text });
    return;
  }

  // En production : on tend la lettre au guichet
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
  });
}
