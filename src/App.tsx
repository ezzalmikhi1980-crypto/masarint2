import { useCallback, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route as WouterRoute, Switch, useLocation, Router as WouterRouter } from 'wouter';
import NotFound from '@/pages/not-found';
import { Intro, SvgDefs } from '@/site/art';
import { Contact, Footer, Header, Home, Services } from '@/site/pages';
import type { Language } from '@/site/data';

const queryClient = new QueryClient();

function Router({ lang }: { lang: Language }) {
  const [location] = useLocation();
  return (
    <ErrorBoundary resetKey={location}>
      <Switch>
        <WouterRoute path="/"><Home lang={lang} /></WouterRoute>
        <WouterRoute path="/services"><Services lang={lang} /></WouterRoute>
        <WouterRoute path="/contact"><Contact lang={lang} /></WouterRoute>
        <WouterRoute component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

const shouldPlayIntro = () => {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return sessionStorage.getItem('masar-intro-seen') !== '1';
  } catch {
    return true;
  }
};

function App() {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('masar-language') as Language) || 'en');
  const [intro, setIntro] = useState<boolean>(shouldPlayIntro);
  const toggleLanguage = () => setLang((current) => { const next = current === 'en' ? 'ar' : 'en'; localStorage.setItem('masar-language', next); return next; });
  const endIntro = useCallback(() => {
    try { sessionStorage.setItem('masar-intro-seen', '1'); } catch { /* ignore */ }
    setIntro(false);
  }, []);
  useEffect(() => { document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; }, [lang]);
  useEffect(() => {
    document.body.style.overflow = intro ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [intro]);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <SvgDefs />
          <div className={`site-shell ${lang === 'ar' ? 'arabic' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <Header lang={lang} onLanguageChange={toggleLanguage} />
            <Router lang={lang} />
            <Footer lang={lang} />
          </div>
          {intro ? <Intro lang={lang} onDone={endIntro} /> : null}
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
