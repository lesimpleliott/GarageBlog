const LOCALE = "fr-FR";
const TIME_ZONE = "Europe/Paris";

/** Date et heure en toutes lettres, à l'heure de Paris : « 7 novembre 2026 à 23:12 ». */
export const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: TIME_ZONE,
});

/** Date simple au format : « 07/11/2026 ». */
export const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "short",
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

/**
 * Date proposée par défaut pour programmer une publication : demain à 9 h, à l'heure locale du navigateur.
 * À calculer au moment où l'on en a besoin (ex. quand on coche « Programmer »), pas au chargement de la page.
 *
 * @returns la valeur à donner à un champ `datetime-local` (« 2026-11-25T09:00 »)
 */
export function getDefaultScheduleValue(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1); // +1 jour (gère tout seul le passage au mois suivant)
  tomorrow.setHours(9, 0, 0, 0); // 9 h 00 min 00 s 000 ms
  return toDateTimeLocalValue(tomorrow);
}

/**
 * Vérifie qu'une valeur de champ `datetime-local` est dans le futur, par exemple avant de programmer une publication.
 * Une valeur vide ou invalide donne une date invalide, qui n'est jamais « dans le futur » : la fonction renvoie alors `false`.
 *
 * @param value - la valeur du champ (« 2026-11-25T09:00 »), à l'heure locale du navigateur
 * @returns `true` si la date est après maintenant, `false` sinon
 */
export function isFutureDateValue(value: string): boolean {
  return new Date(value) > new Date();
}
