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
        <p className="inline">L&apos;article est en brouillon</p>
      )}

      {/* BANNIÈRE PROGRAMMÉ */}
      {status === "scheduled" && (
        <div className="flex items-center justify-between gap-4">
          {isRescheduling ? (
            <p>
              Nouvelle date de publication :{" "}
              <input
                type="datetime-local"
                aria-label="Nouvelle date de publication"
                value={scheduledDate}
                min={toDateTimeLocalValue(new Date())}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
              {isRescheduling && !isFutureDateValue(scheduledDate) && (
                <span className="ml-2 text-red-600">
                  La date doit être dans le futur.
                </span>
              )}
            </p>
          ) : (
            <p>
              Publication programmée le{" "}
              <time dateTime={publishedAt?.toISOString()}>
                {publishedAt && dateTimeFormatter.format(publishedAt)}
              </time>
            </p>
          )}

          {error && (
            <p role="alert" className="flex-1 text-right text-red-600">
              {error}
            </p>
          )}

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
              disabled={
                isPending ||
                (isRescheduling && !isFutureDateValue(scheduledDate))
              }
              className={clsx(
                "cursor-pointer rounded-md px-2 py-1 not-italic transition-colors disabled:cursor-not-allowed",
                "border border-amber-500",
                "bg-amber-600/30 text-amber-700 hover:bg-amber-600/50",
                "dark:bg-amber-800/60 dark:text-amber-400 dark:hover:bg-amber-800/90",
              )}
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
