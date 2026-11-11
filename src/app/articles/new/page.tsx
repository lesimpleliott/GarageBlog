import ArticleForm from "@/blocks/ArticleForm";
import { createArticle } from "@/server/articles/actions";
import { requireSession } from "@/server/auth/queries";

export default async function NewArticlePage() {
  // Vérifie qu'un utilisateur est connecté avant de continuer
  await requireSession();

  return (
    <>
      <h1>Nouvel article</h1>
      <ArticleForm action={createArticle} />
    </>
  );
}
