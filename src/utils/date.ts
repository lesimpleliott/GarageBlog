const LOCALE = "fr-FR";
const TIME_ZONE = "Europe/Paris";

/** Date et heure en toutes lettres, à l'heure de Paris : « 7 novembre 2026 à 23:12 ». */
export const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: TIME_ZONE,
});
