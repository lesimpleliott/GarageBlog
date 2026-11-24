import { Pill } from "@/components/Pill";
import { getArticles } from "@/server/articles/queries";
import { getSession } from "@/server/auth/queries";
import { ARTICLE_STATUS, getArticleStatus } from "@/utils/articleStatus";
import { dateFormatter } from "@/utils/date";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import Link from "next/link";

export default async function ArticlesPage() {
  const session = await getSession(); // Récupère la session (null pour un visiteur) pour afficher ou non les boutons
  const allArticles = await getArticles(); // Récupère les articles du tableau `articles`

  return (
    <>
      <h1 className="sr-only">Articles</h1>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allArticles.map((article) => {
          const statusKey = getArticleStatus(article);
          const status = ARTICLE_STATUS[statusKey];

          return (
            // ARTICLE
            <li key={article.id} className="overflow-hidden rounded-lg border">
              <Link href={`/articles/${article.id}`} className="block h-full">
                {/* HEADER */}
                <div className="border-b bg-foreground-secondary/20 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <h2 className="font-title text-2xl leading-6">
                      {article.title}
                    </h2>
                    {session && <Pill tone={status.tone} text={status.label} />}
                  </div>
                  <p className="pt-1 text-xs text-foreground-secondary">
                    Écrit par {article.authorName}{" "}
                    {article.publishedAt && (
                      <time dateTime={article.publishedAt.toISOString()}>
                        le {dateFormatter.format(article.publishedAt)}
                      </time>
                    )}
                  </p>
                </div>
                {/* BODY */}
                <p className="px-3 py-2">{article.body}</p>
              </Link>
            </li>
          );
        })}

        {/* AJOUTER UN ARTICLE */}
        {session && (
          <li
            className={clsx(
              "rounded-lg border border-dotted transition-colors",
              "border-foreground-secondary hover:border-foreground",
              "hover:bg-foreground-secondary/20",
              "text-foreground-secondary hover:text-foreground",
            )}
          >
            <Link
              href="/articles/new"
              className={clsx(
                "h-full",
                "flex items-center justify-center gap-2",
              )}
            >
              <FontAwesomeIcon
                icon={faPlus}
                className="rounded-full border px-0.5 py-1"
              />
              <span className="font-title text-2xl">Créer un article</span>
            </Link>
          </li>
        )}
      </ul>
    </>
  );
}
