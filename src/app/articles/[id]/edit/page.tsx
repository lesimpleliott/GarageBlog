import ArticleForm from "@/blocks/ArticleForm";
import { updateArticle } from "@/server/articles/action";
import { db } from "@/server/db";
import { articles } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function EditArticlePage({
  params,
}: PageProps<"/articles/[id]/edit">) {
  const { id } = await params;

  const articleId = Number(id);
  if (!Number.isInteger(articleId)) {
    notFound();
  }

  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, articleId));

  if (!article) {
    notFound();
  }

  // updateArticle avec l'id déjà rempli : le formulaire n'a plus qu'à envoyer les champs
  const updateThisArticle = updateArticle.bind(null, articleId);

  return (
    <>
      <h1>Edit {article.title}</h1>

      <ArticleForm
        action={updateThisArticle}
        defaultValues={{ title: article.title, body: article.body }}
      />
    </>
  );
}
