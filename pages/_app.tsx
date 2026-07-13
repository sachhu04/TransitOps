import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Space_Grotesk } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/layout/Layout";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

import { ThemeProvider } from "next-themes";

export default function App({ Component, pageProps, router }: AppProps) {
  // Do not use the layout for the login page
  const isLoginPage = router.pathname === "/login";

  return (
    <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange forcedTheme={isLoginPage ? "light" : undefined}>
      <div className={`${spaceGrotesk.className} min-h-screen font-sans antialiased text-foreground`}>
        <TooltipProvider>
          {isLoginPage ? (
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
