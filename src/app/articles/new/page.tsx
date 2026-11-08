import { createArticle } from "@/server/articles/action";
import clsx from "clsx";

export default function NewArticlePage() {
  return (
    <>
      <h1>Nouvel article</h1>

      <form action={createArticle} className="mt-4 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          Titre
          <input
            name="title"
            required
            maxLength={200}
            className="rounded border px-2 py-1 bg-foreground-secondary/10"
          />
        </label>

        <label className="flex flex-col gap-1">
          Texte
          <textarea
            name="body"
            required
            rows={10}
            className="rounded border px-2 py-1 bg-foreground-secondary/10"
          />
        </label>

        <button
          type="submit"
          className={clsx(
            "cursor-pointer self-start rounded border px-3 py-1",
            "transition-colors hover:bg-foreground-secondary",
          )}
        >
          Publier
        </button>
      </form>
    </>
  );
}
