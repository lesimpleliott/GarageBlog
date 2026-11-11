import ArticleForm from "@/blocks/ArticleForm";
import { updateArticle } from "@/server/articles/actions";
import { getArticle } from "@/server/articles/queries";
import { requireSession } from "@/server/auth/queries";

export default async function EditArticlePage({
  params,
}: PageProps<"/articles/[id]/edit">) {
  // Vérifie qu'un utilisateur est connecté avant de continuer
  await requireSession();

  const { id } = await params;
  const article = await getArticle(id);

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
