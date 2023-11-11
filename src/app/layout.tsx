import './globals.css';
import { Inter } from 'next/font/google';
import Providers from '@/utils/provider';
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'mines.rocks: data driven course selection',
  description:
    'See grade distributions, assignment weights, and other historical data for your courses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <script async src="https://w.appzi.io/w.js?token=825tC"></script>

      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
