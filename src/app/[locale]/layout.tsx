import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import { Inter } from "next/font/google";
import "../globals.css";
import { ChunkLoadErrorHandler } from "@/components/chunk-load-error-handler";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import WorkspaceLayoutWrapper from "./workspace-layout-wrapper";

const THEME_SCRIPT = `
(function(){
  var k='workspace-theme';
  try {
    var s=localStorage.getItem(k);
    if(s==='dark'){document.documentElement.classList.add('dark');}
    else if(s==='light'){document.documentElement.classList.remove('dark');}
    else if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark');}
    else{document.documentElement.classList.remove('dark');}
  }catch(e){}
})();
`;

const CHUNK_ERROR_SCRIPT = `
(function(){
  var k='chunk-error-refreshed';
  function isChunkErr(e){
    return e&&(e.name==='ChunkLoadError'||(e.message&&e.message.includes('Loading chunk'))||(e.message&&e.message.includes('Failed to fetch dynamically imported module')));
  }
  function tryReload(){
    if(!sessionStorage.getItem(k)){
      sessionStorage.setItem(k,'1');
      location.reload();
    }
  }
  window.addEventListener('error',function(ev){if(isChunkErr(ev.error))tryReload();});
  window.addEventListener('unhandledrejection',function(ev){if(isChunkErr(ev.reason))tryReload();});
})();
`;

const inter = Inter({ subsets: ["latin"] });
const locales = ["en", "pt", "es"];

type Props = {
  readonly children: React.ReactNode;
  readonly params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_SCRIPT}
        </Script>
        <Script id="chunk-error-handler" strategy="beforeInteractive">
          {CHUNK_ERROR_SCRIPT}
        </Script>
        <ThemeProvider>
          <ChunkLoadErrorHandler>
            <NextIntlClientProvider messages={messages} locale={locale}>
              <WorkspaceLayoutWrapper>{children}</WorkspaceLayoutWrapper>
            </NextIntlClientProvider>
          </ChunkLoadErrorHandler>
        </ThemeProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "pt" }, { locale: "es" }];
}
