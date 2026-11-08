import { db } from "@/server/db";
import { articles } from "@/server/db/schema";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { connection } from "next/server";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

export default async function ArticlesPage() {
  // Relit la base à chaque visite de la page
  await connection();

  // Récupère les articles depuis la base via `db`
  // (SQL:) SELECT * FROM articles ORDER BY created_at DESC
  const allArticles = await db
    .select()
    .from(articles)
    .orderBy(desc(articles.createdAt));

  return (
    <>
      <h1 className="sr-only">Articles</h1>

      <ul className="grid grid-cols-3 gap-4">
        {/* TOUS LES ARTICLES */}
        {allArticles.map((article) => (
          // ARTICLE
          <li key={article.id} className="rounded-lg border">
            {/* HEADER */}
            <div className="border-b bg-foreground-secondary/20 px-3 pt-1 pb-2">
              <h2 className="-mb-2 font-title text-2xl">{article.title}</h2>
              <time
                className="text-xs text-foreground-secondary"
                dateTime={article.createdAt.toISOString()}
              >
                {dateFormatter.format(article.createdAt)}
              </time>
            </div>

            {/* BODY */}
            <p className="px-3 py-2">{article.body}</p>
          </li>
        ))}

        {/* AJOUTER UN ARTICLE */}
        <li
          className={clsx(
            "",
            "rounded-lg border border-dotted transition-colors",
            "border-foreground-secondary hover:border-foreground",
            "hover:bg-foreground-secondary/20",
            "text-foreground-secondary hover:text-foreground",
          )}
        >
          <Link
            href="/articles/new"
            className={clsx("h-full", "flex items-center justify-center gap-2")}
          >
            <FontAwesomeIcon
              icon={faPlus}
              className="rounded-full border px-0.5 py-1"
            />
            <span className="font-title text-2xl">Créer un article</span>
          </Link>
        </li>
      </ul>
    </>
  );
}
