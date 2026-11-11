import ArticleForm from "@/blocks/ArticleForm";
import { createArticle } from "@/server/articles/actions";

export default function NewArticlePage() {
  return (
    <>
      <h1>Nouvel article</h1>
      <ArticleForm action={createArticle} />
    </>
  );
}
