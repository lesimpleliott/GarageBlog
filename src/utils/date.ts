const LOCALE = "fr-FR";
const TIME_ZONE = "Europe/Paris";

/** Date et heure en toutes lettres, à l'heure de Paris : « 7 novembre 2026 à 23:12 ». */
export const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: TIME_ZONE,
});

/**
 * Date au format attendu par un champ `datetime-local` (« 2026-11-24T09:00 »), à l'heure locale du navigateur.
 *
 * @param date - la date à convertir
 * @returns la valeur à donner au champ
 */
export function toDateTimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0"); // 9 → "09"
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
