import { ArrowRight, Check, Columns2, X } from 'lucide-react';
import { Footer, Header } from './components/Layout';
import { Link } from './components/Link';
import { GalleryProvider, useGallery } from './hooks/useGallery';
import { AboutPage } from './pages/AboutPage';
import { ComparePage } from './pages/ComparePage';
import { GuidePage } from './pages/GuidePage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SavedPage } from './pages/SavedPage';
import { ThemePage } from './pages/ThemePage';
function GalleryApp() {
  const { path, themeId, locale, t, activeCompared, themes, updateCompare, toast } = useGallery();
  let page;
  if (path === '/') page = <HomePage />;
  else if (path === '/saved') page = <SavedPage />;
  else if (path === '/compare') page = <ComparePage />;
  else if (themeId) page = <ThemePage />;
  else if (path === '/guide') page = <GuidePage />;
  else if (path === '/about') page = <AboutPage />;
  else page = <NotFoundPage />;
  return (
    <>
      <Link className="skip-link" href="#main">
        {locale === 'zh' ? '跳至主要内容' : 'Skip to content'}
      </Link>
      <Header />
      <main id="main">{page}</main>
      <Footer />{' '}
      {activeCompared.length > 0 && path !== '/compare' && (
        <aside className="compare-tray" aria-label={t.compare}>
          <Columns2 size={19} />
          <span>
            {activeCompared.length}/2 <span className="tray-label">{t.compare}</span>
          </span>
          <div className="tray-swatches">
            {activeCompared.map((id) => (
              <i
                key={id}
                style={{ background: themes.find((theme) => theme.id === id)?.palette.background }}
              />
            ))}
          </div>
          <Link href="/compare">
            {t.compareAction}
            <ArrowRight size={16} />
          </Link>
          <button onClick={() => updateCompare([])} className="icon-button" aria-label={t.clear}>
            <X size={16} />
          </button>
        </aside>
      )}
      {toast && (
        <div role="status" className="toast">
          <Check size={17} />
          {toast}
        </div>
      )}
    </>
  );
}
export default function App() {
  return (
    <GalleryProvider>
      <GalleryApp />
    </GalleryProvider>
  );
}
