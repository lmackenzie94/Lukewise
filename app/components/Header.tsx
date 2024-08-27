'use client';

import Link from 'next/link';
import { SITE_TITLE, NAV_LINKS } from '../constants';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="mb-8 container">
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-200 py-6 sm:py-10">
        <Link href="/">
          <p className="text-2xl sm:text-3xl font-black">
            {SITE_TITLE}
            <span className="text-blue-500 font-bold mx-1">/</span>
            <span className="text-gray-500 text-xs sm:text-sm font-mono uppercase">
              {pathname.split('/')[1]}
            </span>
          </p>
        </Link>
        <div className="flex items-center gap-8 mt-4 sm:mt-0 text-sm sm:text-base font-medium">
          {NAV_LINKS.map(({ label, href, colours }) => {
            const isActive = pathname === href;
            return (
              <Link
                href={href}
                key={href}
                className={`hover:underline ${isActive ? colours.text : ''}`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
