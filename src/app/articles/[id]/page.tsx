import DeleteArticleButton from "@/blocks/articles/DeleteArticleButton";
import EditArticleBanner from "@/blocks/articles/EditArticleBanner";
import UnpublishArticleButton from "@/blocks/articles/UnpublishArticleButton";
import { Pill } from "@/components/Pill";
import { deleteArticle, unpublishArticle } from "@/server/articles/actions";
import { canEditArticle } from "@/server/articles/permissions";
import { getArticle } from "@/server/articles/queries";
import { getSession } from "@/server/auth/queries";
import { ARTICLE_STATUS, getArticleStatus } from "@/utils/articleStatus";
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
  const unpublishThisArticle = unpublishArticle.bind(null, article.id);
  const statusKey = getArticleStatus(article);
  const status = ARTICLE_STATUS[statusKey];

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1>{article.title}</h1>
        {session && <Pill tone={status.tone} text={status.label} />}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground-secondary">
          Écrit par <strong>{article.authorName}</strong>
          {statusKey !== "draft" && article.publishedAt && (
            <time dateTime={article.publishedAt.toISOString()}>
              , publié le {dateTimeFormatter.format(article.publishedAt)}
            </time>
          )}
        </p>
        {canEdit && (
          <div className="flex items-center gap-4 text-sm">
            {statusKey !== "draft" && (
              <UnpublishArticleButton
                action={unpublishThisArticle}
                needsConfirm={statusKey === "published"}
              />
            )}
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

      {canEdit && statusKey !== "published" && (
        <EditArticleBanner
          articleId={article.id}
          status={statusKey}
          publishedAt={article.publishedAt}
        />
      )}

      <p className="mt-4 border-t border-foreground-secondary pt-4">
        {article.body}
      </p>
    </>
  );
}
