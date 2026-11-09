import DeleteArticleButton from "@/blocks/DeleteArticleButton";
import { deleteArticle } from "@/server/articles/action";
import { db } from "@/server/db";
import { articles } from "@/server/db/schema";
import { dateTimeFormatter } from "@/utils/date";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ArticlePage({
  params,
}: PageProps<"/articles/[id]">) {
  // Recupère l'ID de l'article dans l'URL
  const { id } = await params;

  // Convertit en `number`pour utilisation
  const articleId = Number(id);
  if (!Number.isInteger(articleId)) {
    notFound();
  }

  // Recupère l'article
  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, articleId));

  if (!article) {
    notFound();
  }

  const deleteThisArticle = deleteArticle.bind(null, article.id);

  return (
    <>
      <h1>{article.title}</h1>

      <div className="flex items-center justify-between">
        <time
          className="text-sm text-foreground-secondary"
          dateTime={article.createdAt.toISOString()}
        >
          {dateTimeFormatter.format(article.createdAt)}
        </time>
        <div className="flex items-center gap-4 text-sm">
          <Link
            href={`/articles/${article.id}/edit`}
            className="transition-colors hover:text-foreground-secondary"
          >
            <FontAwesomeIcon icon={faEdit} /> Modifier
          </Link>
          <DeleteArticleButton action={deleteThisArticle} />
        </div>
      </div>

      <p className="mt-4 border-t border-foreground-secondary pt-4">
        {article.body}
      </p>
    </>
  );
}
