'use client';

import Link from 'next/link';
import { SITE_TITLE, navLinks } from '../constants';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="mb-10 container">
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-200 py-6 sm:py-10">
        <Link href="/">
          <p className="text-3xl font-black">
            {SITE_TITLE}
            <span className="text-blue-500 font-bold mx-1">/</span>
            <span className="text-gray-500 text-base font-bold font-mono">
              {pathname.split('/')[1].toUpperCase()}
            </span>
          </p>
        </Link>
        <div className="flex items-center gap-8 mt-4 sm:mt-0">
          {navLinks.map(({ label, href }) => (
            <Link href={href} key={href}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
