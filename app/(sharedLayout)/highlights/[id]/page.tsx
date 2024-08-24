import { getBook, getHighlight } from '@/app/lib/readwise';

export const revalidate = 3600; // 1 hour

export default async function HighlightPage({
  params
}: {
  params: { id: string };
}) {
  const highlight = await getHighlight(params.id);
  const book = await getBook(highlight.book_id.toString());

  return (
    <main className="container">
      <p className="text-2xl font-bold">{highlight.text}</p>
      <p className="text-2xl font-bold">{book.title}</p>
    </main>
  );
}
