// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css';
import './globals.css';
import Head from 'next/head';

import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core';

export const metadata = {
  title: 'Odysseus Advisor',
  description: 'description',
  icons: {
    icon: 'favicon.ico',
  }
};

const theme = createTheme({

})

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
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}