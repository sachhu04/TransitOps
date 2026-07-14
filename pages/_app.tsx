import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Space_Grotesk } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/layout/Layout";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans" });

import { ThemeProvider } from "next-themes";

export default function App({ Component, pageProps, router }: AppProps) {
  // Do not use the layout for authentication pages
  const isAuthPage = [
    '/login',
    '/forgot-password',
    '/reset-password',
    '/setup-account'
  ].includes(router.pathname);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
      <style jsx global>{`
        :root {
          --font-sans: ${spaceGrotesk.style.fontFamily};
        }
        body {
          font-family: var(--font-sans), sans-serif;
        }
      `}</style>
      <div className={`${spaceGrotesk.variable} ${spaceGrotesk.className} min-h-screen font-sans antialiased text-foreground`}>
        <TooltipProvider>
          {isAuthPage ? (
            <Component {...pageProps} />
          ) : (
            <Layout>
              <Component {...pageProps} />
            </Layout>
          )}
          <Toaster />
        </TooltipProvider>
      </div>
    </ThemeProvider>
  );
}
