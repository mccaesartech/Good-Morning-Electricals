import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-jakarta' });

export const metadata: Metadata = {
  title: 'GME Admin Dashboard',
  description: 'Good Morning Electrical Engineering Academy — Content Management',
  robots: 'noindex, nofollow'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jakarta.variable}`}>{children}</body>
    </html>
  );
}
