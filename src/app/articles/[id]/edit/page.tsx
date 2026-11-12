import ArticleForm from "@/blocks/ArticleForm";
import { updateArticle } from "@/server/articles/actions";
import { canEditArticle } from "@/server/articles/permissions";
import { getArticle } from "@/server/articles/queries";
import { requireSession } from "@/server/auth/queries";
import { notFound } from "next/navigation";

export default async function EditArticlePage({
  params,
}: PageProps<"/articles/[id]/edit">) {
  const session = await requireSession(); // Vérifie qu'un utilisateur est connecté avant de continuer
  const { id } = await params; // récupère l'id dans l'URL
  const article = await getArticle(id); // Récupère l'article à partir de son id

  // Vérifie les permissions de l'utilisateur, ou le renvoie vers une 404
  if (!canEditArticle(session.user, article)) {
    notFound();
  }

  // Fonction de mise à jour d'un article
  const updateThisArticle = updateArticle.bind(null, article.id);

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
