import type { Metadata } from 'next';
import './globals.css';
import { SITE_DESCRIPTION, SITE_TITLE } from './constants';

export const metadata: Metadata = {
  title: `${SITE_TITLE}`,
  description: SITE_DESCRIPTION
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col mb-24">{children}</body>
    </html>
  );
}
