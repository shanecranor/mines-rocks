import './globals.css'
import { Inter } from 'next/font/google'
import Providers from '@/utils/provider'
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Canvas Aggregator',
  description: 'View all your canvas courses in one place, see historical data, and more!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
