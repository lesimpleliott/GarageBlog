import DeleteArticleButton from "@/blocks/DeleteArticleButton";
import { deleteArticle } from "@/server/articles/actions";
import { getArticle } from "@/server/articles/queries";
import { getSession } from "@/server/auth/queries";
import { dateTimeFormatter } from "@/utils/date";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default async function ArticlePage({
  params,
}: PageProps<"/articles/[id]">) {
  // Récupère la session (null pour un visiteur) pour afficher ou non les boutons
  const session = await getSession();

  const { id } = await params;
  const article = await getArticle(id);

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
        {session && (
          <div className="flex items-center gap-4 text-sm">
            <Link
              href={`/articles/${article.id}/edit`}
              className="transition-colors hover:text-foreground-secondary"
            >
              <FontAwesomeIcon icon={faEdit} /> Modifier
            </Link>
            <DeleteArticleButton action={deleteThisArticle} />
          </div>
        )}
      </div>

      <p className="mt-4 border-t border-foreground-secondary pt-4">
        {article.body}
      </p>
    </>
  );
}
