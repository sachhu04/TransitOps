import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/layout/Layout";

const inter = Inter({ subsets: ["latin"] });

import { ThemeProvider } from "next-themes";

export default function App({ Component, pageProps, router }: AppProps) {
  // Do not use the layout for the login page
  const isLoginPage = router.pathname === "/login";

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className={`${inter.className} min-h-screen bg-background font-sans antialiased text-foreground`}>
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
