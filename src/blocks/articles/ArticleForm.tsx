"use client";

import type { ArticleFormState } from "@/server/articles/actions";
import type { ArticleFields } from "@/server/db/schema/articles";
import {
  getDefaultScheduleValue,
  isFutureDateValue,
  toDateTimeLocalValue,
} from "@/utils/date";
import clsx from "clsx";
import {
  type ChangeEvent,
  type SubmitEvent,
  startTransition,
  useActionState,
  useState,
} from "react";

type ArticleFormProps = {
  action: (
    state: ArticleFormState,
    formData: FormData,
  ) => Promise<ArticleFormState>;
  defaultValues?: ArticleFields;
  mode: "create" | "edit";
};

// Réponse de départ, vide : le serveur n'a encore rien répondu
const initialState: ArticleFormState = {};

/** Formulaire d'article, avec les erreurs renvoyées par le serveur. */
export default function ArticleForm({
  action,
  defaultValues,
  mode,
}: ArticleFormProps) {
  // Hook useActionState
  // Reçoit :
  //    - `action` : la fonction serveur à appeler
  //    - `initialState` : la réponse de départ, vide
  // Renvoie :
  //    - `state` : la dernière réponse du serveur
  //    - `formAction` : `action` enveloppée, appelée par `handleSubmit`
  //    - `pending` : true pendant l'envoi, false sinon
  const [state, formAction, pending] = useActionState(action, initialState);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const isValidSchedule = isFutureDateValue(scheduledDate);

  /**
   * Envoie le formulaire à la main, au lieu de `<form action>`.
   * Une action appelée à la main doit l'être dans une transition : c'est aussi ce qui met `pending` à jour.
   */
  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget, e.nativeEvent.submitter);
    startTransition(() => formAction(formData));
  }

  /** Coche ou décoche « Programmer la publication ». À chaque fois qu'on coche, la date repart de demain à 9 h. */
  function handleScheduleChange(e: ChangeEvent<HTMLInputElement>) {
    setIsScheduled(e.target.checked);

    if (e.target.checked) {
      setScheduledDate(getDefaultScheduleValue());
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-4 flex flex-col gap-4"
    >
      <label className="flex flex-col gap-1">
        Titre
        <input
          name="title"
          required
          maxLength={200}
          defaultValue={state.values?.title ?? defaultValues?.title}
          aria-invalid={Boolean(state.errors?.title)}
          aria-describedby="title-error"
          className="rounded border bg-foreground-secondary/10 px-2 py-1"
        />
        <span id="title-error" className="text-sm text-red-600">
          {state.errors?.title}
        </span>
      </label>

      <label className="flex flex-col gap-1">
        Texte
        <textarea
          name="body"
          required
          rows={10}
          defaultValue={state.values?.body ?? defaultValues?.body}
          aria-invalid={Boolean(state.errors?.body)}
          aria-describedby="body-error"
          className="rounded border bg-foreground-secondary/10 px-2 py-1"
        />
        <span id="body-error" className="text-sm text-red-600">
          {state.errors?.body}
        </span>
      </label>

      {mode === "create" ? (
        <section className="space-y-4">
          <div className="flex h-6 items-center gap-6">
            <label className="space-x-2">
              <input
                type="checkbox"
                checked={isScheduled}
                onChange={handleScheduleChange}
              />
              <span
                className={clsx(
                  !isScheduled && "text-foreground-secondary italic",
                  "select-none",
                )}
              >
                Programmer la publication
              </span>
            </label>
            {isScheduled && (
              <input
                type="datetime-local"
                value={scheduledDate}
                min={toDateTimeLocalValue(new Date())}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="rounded border border-foreground-secondary bg-foreground/10 p-1 text-sm italic"
                aria-label="Date et heure de publication"
                aria-invalid={!isValidSchedule}
                aria-describedby="schedule-error"
              />
            )}
            {isScheduled && !isValidSchedule && (
              <span id="schedule-error" className="text-sm text-red-600">
                La date doit être dans le futur.
              </span>
            )}

            {isScheduled && scheduledDate && (
              <input
                type="hidden"
                name="publishAt"
                value={new Date(scheduledDate).toISOString()}
              />
            )}
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              name="intent"
              value="publish"
              disabled={pending || (isScheduled && !isValidSchedule)}
              className={clsx(
                "min-w-32",
                "cursor-pointer self-start rounded border px-3 py-1",
                "transition-colors hover:bg-foreground-secondary",
                "disabled:cursor-not-allowed disabled:text-foreground-secondary disabled:italic",
              )}
            >
              {pending
                ? "Publication..."
                : isScheduled
                  ? "Programmer"
                  : "Publier"}
            </button>
            <button
              type="submit"
              name="intent"
              value="draft"
              disabled={pending}
              className={clsx(
                "min-w-32",
                "cursor-pointer self-start rounded border px-3 py-1",
                "transition-colors hover:bg-foreground-secondary",
                "disabled:cursor-not-allowed disabled:text-foreground-secondary disabled:italic",
              )}
            >
              {pending ? "Enregistrement..." : "Brouillon"}
            </button>
          </div>
        </section>
      ) : (
        <button
          type="submit"
          disabled={pending}
          className={clsx(
            "min-w-32",
            "cursor-pointer self-start rounded border px-3 py-1",
            "transition-colors hover:bg-foreground-secondary",
            "disabled:cursor-not-allowed disabled:text-foreground-secondary disabled:italic",
          )}
        >
          {pending ? "Enregistrement..." : "Enregistrer"}
        </button>
      )}
    </form>
  );
}
