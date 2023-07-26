import '../styles/globals.css'
import type { AppProps } from 'next/app'
// react query imports
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { useState } from 'react';

const queryClient = new QueryClient();
export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  return (
  <QueryClientProvider client={queryClient}>
    <Component {...pageProps} />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
  )
}

