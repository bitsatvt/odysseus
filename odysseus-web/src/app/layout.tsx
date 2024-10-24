// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css';
import './globals.css';
import Head from 'next/head';

import { ColorSchemeScript, MantineProvider } from '@mantine/core';

export const metadata = {
  title: 'Odysseus Advisor',
  description: 'Find detailed course and professor information.',
  // icons: {
  //   icon: 'favicon.ico',
  // }
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <ColorSchemeScript />
      </Head>
      <body >
        <MantineProvider>{children}</MantineProvider>
      </body>
    </html>
  );
}