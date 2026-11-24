import { type PillTone } from "@/components/Pill";
import { type Article } from "@/server/db/schema/articles";

/** Les statuts possibles d'un article, déduits de la base : rien n'est stocké sous ce nom. */
export type ArticleStatus = "published" | "scheduled" | "draft";

/** Le libellé et la couleur de pastille de chaque statut. */
export const ARTICLE_STATUS: Record<
  ArticleStatus,
  { label: string; tone: PillTone }
> = {
  published: { label: "Publié", tone: "green" },
  scheduled: { label: "Programmé", tone: "orange" },
  draft: { label: "Brouillon", tone: "gray" },
};

/**
 * Déduit le statut d'un article.
 *
 * @param article.status - le `status` de l'article
 * @param article.publishedAt - la date de publication de l'article
 * @returns "published" | "scheduled" | "draft"
 */
export function getArticleStatus(
  article: Pick<Article, "status" | "publishedAt">,
): ArticleStatus {
  const isScheduled =
    article.publishedAt !== null && article.publishedAt > new Date();

  return article.status === "draft"
    ? "draft"
    : isScheduled
      ? "scheduled"
      : "published";
}
