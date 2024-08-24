import Link from 'next/link';
import { getHighlights } from '@/app/lib/readwise';
import { Suspense } from 'react';
import Image from 'next/image';
import { ListHighlightWithBookInfo } from '@/app/types';

const PAGE_SIZE = 5;

export default function HighlightsPage({
  searchParams
}: {
  searchParams: { page: string };
}) {
  const currentPage = Number(searchParams.page) || 1;

  return (
    <main className="container max-w-screen-sm">
      <h1 className="text-2xl font-bold inline-block mb-6 sr-only">
        Highlights
      </h1>

      <Suspense fallback={<HighlightSkeleton />}>
        <ListOfHighlights currentPage={currentPage} />
      </Suspense>
    </main>
  );
}

async function ListOfHighlights({ currentPage }: { currentPage: number }) {
  const highlights = await getHighlights({
    page: currentPage,
    pageSize: PAGE_SIZE
  });

  const totalPages = Math.ceil(highlights.count / PAGE_SIZE);

  return (
    <>
      <div className="grid grid-cols-1 gap-8">
        {highlights.results.map(highlight => (
          <HighlightCard key={highlight.id} highlight={highlight} />
        ))}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </>
  );
}

const HighlightCard = ({
  highlight
}: {
  highlight: ListHighlightWithBookInfo;
}) => {
  return (
    <div
      key={highlight.id}
      className="flex flex-col gap-6 bg-white rounded-lg shadow-md overflow-hidden"
    >
      <p className="p-8 pb-2">{highlight.text}</p>

      <div className="flex items-center gap-4 bg-blue-50/70 px-8 py-4">
        {highlight.book.cover_image_url && (
          <Image
            src={highlight.book.cover_image_url}
            alt={highlight.book.title}
            width={100}
            height={100}
            className="rounded-full w-12 h-12"
          />
        )}
        <div>
          <Link
            href={`/books/${highlight.book.id}`}
            className="font-bold underline"
          >
            {highlight.book.title}
          </Link>
          <p className="text-gray-500 text-sm">{highlight.book.author}</p>
        </div>
      </div>
    </div>
  );
};

const HighlightSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: Math.min(PAGE_SIZE, 10) }).map((_, index) => (
        <div key={index} className="bg-gray-300 p-4 rounded-md animate-pulse">
          <div className="h-6 bg-gray-400 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-400 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
};

const Pagination = ({
  currentPage,
  totalPages
}: {
  currentPage: number;
  totalPages: number;
}) => {
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <div className="flex justify-between mt-10 items-center">
      {hasPreviousPage ? (
        <Link
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-300"
          href={`/highlights?page=${currentPage - 1}`}
        >
          Previous
        </Link>
      ) : (
        <div></div>
      )}

      <p className="text-gray-500 text-xs">
        Page {currentPage} of {totalPages}
      </p>
      {hasNextPage ? (
        <Link
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-300"
          href={`/highlights?page=${currentPage + 1}`}
        >
          Next
        </Link>
      ) : (
        <div></div>
      )}
    </div>
  );
};
