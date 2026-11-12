import DeleteArticleButton from "@/blocks/DeleteArticleButton";
import { deleteArticle } from "@/server/articles/actions";
import { canEditArticle } from "@/server/articles/permissions";
import { getArticle } from "@/server/articles/queries";
import { getSession } from "@/server/auth/queries";
import { dateTimeFormatter } from "@/utils/date";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default async function ArticlePage({
  params,
}: PageProps<"/articles/[id]">) {
  const session = await getSession(); // Récupère la session (null pour un visiteur) pour afficher ou non les boutons
  const { id } = await params; // récupère l'id dans l'URL
  const article = await getArticle(id); // Récupère l'article à partir de son id
  const canEdit = session && canEditArticle(session.user, article); // Vérifie les permissions de l'utilisateur

  // Fonction de suppression d'un article
  const deleteThisArticle = deleteArticle.bind(null, article.id);

  return (
    <>
      <h1>{article.title}</h1>

      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground-secondary">
          Écrit par <strong>{article.authorName}</strong>{" "}
          <time dateTime={article.createdAt.toISOString()}>
            le {dateTimeFormatter.format(article.createdAt)}
          </time>
        </p>
        {canEdit && (
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
