"use client";

import type { ArticleFormState } from "@/server/articles/actions";
import type { ArticleFields } from "@/server/db/schema";
import clsx from "clsx";
import { useActionState } from "react";

type ArticleFormProps = {
  action: (
    state: ArticleFormState,
    formData: FormData,
  ) => Promise<ArticleFormState>;
  defaultValues?: ArticleFields;
};

// Réponse de départ, vide : le serveur n'a encore rien répondu
const initialState: ArticleFormState = {};

/** Formulaire d'article, avec les erreurs renvoyées par le serveur. */
export default function ArticleForm({
  action,
  defaultValues,
}: ArticleFormProps) {
  // Hook useActionState
  // Reçoit :
  //    - `action` : la fonction serveur à appeler
  //    - `initialState` : la réponse de départ, vide
  // Renvoie :
  //    - `state` : la dernière réponse du serveur
  //    - `formAction` : `action` enveloppée, à donner au <form>
  //    - `pending` : true pendant l'envoi, false sinon
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} noValidate className="mt-4 flex flex-col gap-4">
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

      <button
        type="submit"
        className={clsx(
          "cursor-pointer self-start rounded border px-3 py-1",
          "transition-colors hover:bg-foreground-secondary",
          "disabled:cursor-not-allowed disabled:text-foreground-secondary disabled:italic",
        )}
        disabled={pending}
      >
        {pending ? "Publication..." : "Publier"}
      </button>
    </form>
  );
}
