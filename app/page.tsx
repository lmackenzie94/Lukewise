import Link from 'next/link';
import { NAV_LINKS, SITE_TITLE, SITE_DESCRIPTION } from './constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `${SITE_TITLE} | Home`,
  description: SITE_DESCRIPTION
};

export default function Home() {
  return (
    <main className="container flex flex-col items-center justify-center pt-24 sm:pt-32">
      <div className="bg-white p-8 sm:p-16 rounded-2xl shadow-lg text-center w-full max-w-xl">
        <h1 className="text-4xl md:text-5xl font-black mb-8 pb-6 border-b">
          {SITE_TITLE}
        </h1>

        {NAV_LINKS.map(({ label, href, colours, emoji }) => (
          <Link
            href={href}
            key={href}
            className={`block text-lg md:text-2xl font-bold py-4 px-8 ${colours.text} bg-slate-50 border-2 shadow-[5px_5px_0_0] mb-5 ${colours.border} font-mono font-bold tracking-tight ${colours.bgFaded} hocus:shadow-none transition-all duration-500 ${colours.hocus} hocus:text-white hocus:outline-none`}
          >
            {label} {emoji}
          </Link>
        ))}
      </div>
    </main>
  );
}
