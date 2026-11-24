"use client";

import { publishArticle } from "@/server/articles/actions";
import { type ArticleStatus } from "@/utils/articleStatus";
import {
  dateTimeFormatter,
  getDefaultScheduleValue,
  isFutureDateValue,
  toDateTimeLocalValue,
} from "@/utils/date";
import clsx from "clsx";
import { useState, useTransition } from "react";

type EditArticleBannerProps = {
  articleId: number;
  status: ArticleStatus;
  publishedAt: Date | null;
  className?: string;
};

// Style du bouton principal (Publier / Programmer / Valider), partagé par les deux bandeaux
const PUBLISH_BUTTON_CLASSES = clsx(
  "cursor-pointer rounded-md px-2 py-1 not-italic transition-colors disabled:cursor-not-allowed",
  "border border-amber-500",
  "bg-amber-600/30 text-amber-700 hover:bg-amber-600/50",
  "dark:bg-amber-800/60 dark:text-amber-400 dark:hover:bg-amber-800/90",
);

/**
 * Bandeau de gestion de la publication, sur la page d'un article (réservé à son auteur et aux admins).
 *  - Brouillon : publier tout de suite, ou cocher « Programmer la publication » pour choisir une date (demain 9 h par défaut).
 *  - Programmé : publier tout de suite, ou modifier la date (préremplie avec la date prévue).
 * Les dates passées sont refusées. La date choisie est envoyée en UTC à `publishArticle`.
 *
 * @param articleId - l'id de l'article
 * @param status - le statut calculé par `getArticleStatus` (`draft` ou `scheduled` : pas de bandeau pour un article publié)
 * @param publishedAt - la date de publication enregistrée (`null` pour un brouillon)
 * @param className - classes ajoutées à celles du bandeau
 */
export default function EditArticleBanner({
  articleId,
  status,
  publishedAt,
  className,
}: EditArticleBannerProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");

  function handlePublish() {
    setError(null);
    const publishAt = isRescheduling
      ? new Date(scheduledDate).toISOString()
      : undefined;

    startTransition(async () => {
      try {
        await publishArticle(articleId, publishAt);
        setIsRescheduling(false);
      } catch {
        setError("Échec de la publication");
      }
    });
  }
  /** Ouvre ou ferme le choix d'une date : la case « Programmer » (brouillon) ou « Modifier la date » / « Annuler » (programmé). */
  function handleReschedule() {
    setError(null);

    if (!isRescheduling) {
      setScheduledDate(
        publishedAt
          ? toDateTimeLocalValue(publishedAt)
          : getDefaultScheduleValue(),
      );
      setIsRescheduling(true);
    } else {
      setIsRescheduling(false);
    }
  }

  // Champ date et message d'erreur, partagés par les deux bandeaux
  const dateField = (
    <>
      <input
        type="datetime-local"
        aria-label="Date de publication"
        aria-invalid={!isFutureDateValue(scheduledDate)}
        aria-describedby="schedule-error"
        value={scheduledDate}
        min={toDateTimeLocalValue(new Date())}
        onChange={(e) => setScheduledDate(e.target.value)}
      />
      {!isFutureDateValue(scheduledDate) && (
        <span id="schedule-error" className="ml-2 text-red-600">
          La date doit être dans le futur.
        </span>
      )}
    </>
  );

  // Zone d'erreur du serveur, partagée par les deux bandeaux
  const errorMessage = error && (
    <p role="alert" className="flex-1 text-right text-red-600">
      {error}
    </p>
  );

  // Le bouton principal est grisé pendant l'envoi, ou si la date choisie est passée
  const isPublishDisabled =
    isPending || (isRescheduling && !isFutureDateValue(scheduledDate));

  return (
    <section
      className={clsx(
        className,
        "border-amber-500 bg-amber-500/30",
        "mt-4 rounded-lg border px-2 py-2",
        "text-sm text-amber-700 italic dark:text-amber-500",
      )}
    >
      {/* BANNIÈRE BROUILLON */}
      {status === "draft" && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <p>L&apos;article est en brouillon</p>
            <label className="flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                checked={isRescheduling}
                onChange={handleReschedule}
                disabled={isPending}
              />
              Programmer la publication
            </label>
            {isRescheduling && <p>{dateField}</p>}
          </div>

          {errorMessage}

          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishDisabled}
            className={PUBLISH_BUTTON_CLASSES}
          >
            {isPending
              ? "Publication..."
              : isRescheduling
                ? "Programmer"
                : "Publier maintenant"}
          </button>
        </div>
      )}

      {/* BANNIÈRE PROGRAMMÉ */}
      {status === "scheduled" && (
        <div className="flex items-center justify-between gap-4">
          {isRescheduling ? (
            <p>Nouvelle date de publication : {dateField}</p>
          ) : (
            <p>
              Publication programmée le{" "}
              <time dateTime={publishedAt?.toISOString()}>
                {publishedAt && dateTimeFormatter.format(publishedAt)}
              </time>
            </p>
          )}

          {errorMessage}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleReschedule}
              disabled={isPending}
              className="cursor-pointer hover:underline"
            >
              {isRescheduling ? "Annuler" : "Modifier la date"}
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishDisabled}
              className={PUBLISH_BUTTON_CLASSES}
            >
              {isPending
                ? "Publication..."
                : isRescheduling
                  ? "Valider la nouvelle date"
                  : "Publier maintenant"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
