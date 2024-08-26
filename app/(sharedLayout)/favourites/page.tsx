import Link from 'next/link';
import { getFavouriteHighlights } from '@/app/lib/readwise';
import { Suspense } from 'react';
import Image from 'next/image';
import { FavouriteHighlight } from '@/app/types';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const PAGE_SIZE = 5;

export default function FavouritesPage({
  searchParams
}: {
  searchParams: { page: string };
}) {
  const currentPage = Number(searchParams.page) || 1;

  return (
    <main className="container max-w-screen-sm">
      <h1 className="text-2xl font-bold inline-block mb-6">Favourites ❤️</h1>

      <Suspense fallback={<HighlightSkeleton />}>
        <ListOfHighlights currentPage={currentPage} />
      </Suspense>
    </main>
  );
}

async function ListOfHighlights({ currentPage }: { currentPage: number }) {
  const highlights = await getFavouriteHighlights({
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

const HighlightCard = ({ highlight }: { highlight: FavouriteHighlight }) => {
  return (
    <div
      key={highlight.id}
      className="flex flex-col gap-6 bg-white rounded-lg shadow-md overflow-hidden"
    >
      <p className="p-8 pb-2">{highlight.text}</p>

      <div className="flex items-center gap-4 bg-blue-50/70 px-8 py-4">
        {highlight.cover_image_url && (
          <Image
            src={highlight.cover_image_url}
            alt={highlight.title}
            width={100}
            height={100}
            className="rounded-full w-12 h-12"
          />
        )}
        <div>
          <p className="font-bold">{highlight.title}</p>
          <p className="text-gray-500 text-sm">{highlight.author}</p>
        </div>
      </div>
    </div>
  );
};

const HighlightSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: Math.min(PAGE_SIZE, 10) }).map((_, index) => (
        <div
          key={index}
          className="bg-gray-200 px-4 py-8 rounded-md animate-pulse"
        >
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
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
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          href={`/favourites/?page=${currentPage - 1}`}
          aria-label="Previous page"
        >
          <FaArrowLeft />
          <span className="sr-only">Previous page</span>
        </Link>
      ) : (
        <div aria-hidden="true"></div>
      )}

      <p className="text-gray-500 text-xs">
        Page {currentPage} of {totalPages}
      </p>
      {hasNextPage ? (
        <Link
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          href={`/favourites/?page=${currentPage + 1}`}
          aria-label="Next page"
        >
          <FaArrowRight />
          <span className="sr-only">Next page</span>
        </Link>
      ) : (
        <div aria-hidden="true"></div>
      )}
    </div>
  );
};
