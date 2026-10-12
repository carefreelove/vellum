import { ArrowUpRight, Github, Globe2, MoveUpRight } from 'lucide-react';
import { useGallery } from '../hooks/useGallery';
import { localizedHref } from '../lib/location';
import { Link } from './Link';
const sourceUrl = 'https://github.com/carefreelove/vellum';
export function Header() {
  const { locale, t, saved, path } = useGallery();
  return (
    <header className="header">
      <Link href="/" className="brand" aria-label="Vellum">
        <img src="/favicon.svg" alt="" />
        <span>
          vellum<span className="brand-dot">.</span>
        </span>
      </Link>
      <nav aria-label={locale === 'zh' ? '主导航' : 'Main navigation'}>
        <Link href="/#collection" className={path === '/' ? 'active' : ''}>
          {t.explore}
        </Link>
        <Link href="/guide" className={path === '/guide' ? 'active' : ''}>
          {t.guide}
        </Link>
        <Link href="/saved" className={path === '/saved' ? 'active' : ''}>
          {t.saved}
          {saved.length > 0 && <span className="nav-count">{saved.length}</span>}
        </Link>
      </nav>
      <div className="header-actions">
        <button
          className="language"
          aria-label={locale === 'en' ? '切换为中文' : 'Switch to English'}
          onClick={() => {
            window.location.href = localizedHref(
              window.location.pathname + window.location.search + window.location.hash,
              locale === 'en' ? 'zh' : 'en',
            );
          }}
        >
          <Globe2 size={15} />
          <span>{locale === 'en' ? '中文' : 'EN'}</span>
        </button>
        <Link
          className="icon-button github-link"
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={t.source}
        >
          <Github size={19} />
        </Link>
      </div>
    </header>
  );
}
export function Footer() {
  const { t } = useGallery();
  return (
    <footer className="footer container">
      <div className="footer-top">
        <div>
          <Link href="/" className="brand footer-brand">
            vellum<span className="brand-dot">.</span>
          </Link>
          <p>{t.footer}</p>
        </div>
        <div className="footer-links">
          <Link href="/guide">{t.guide}</Link>
          <Link href="/about">{t.about}</Link>
          <Link href={sourceUrl} target="_blank" rel="noreferrer">
            GitHub
            <ArrowUpRight size={14} />
          </Link>
        </div>
        <Link className="back-top" href="#main" aria-label={t.top}>
          <MoveUpRight size={23} />
        </Link>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Vellum. {t.copyright}</span>
        <span>{t.independent}</span>
      </div>
    </footer>
  );
}
