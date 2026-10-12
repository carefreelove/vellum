import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Catalog } from '../components/Catalog';
import { Link } from '../components/Link';
import { Workspace } from '../components/Workspace';
import { useGallery } from '../hooks/useGallery';
import type { Messages } from '../i18n';

export function HomePage() {
  const { themes, locale, t, loadState, theme, cardProps } = useGallery();
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="tiny-star">✳</span>
            {t.eyebrow}
          </p>
          <h1>
            {t.title1}
            <br />
            <span>{t.title2}</span>
          </h1>
          <p className="hero-intro">{t.intro}</p>
          <div className="hero-actions">
            <Link href="#collection" className="button">
              {t.browse}
              <ArrowUpRight size={17} />
            </Link>
            <Link className="text-link" href="/guide">
              {t.how}
              <ArrowRight size={15} />
            </Link>
          </div>
          <div className="hero-edition">
            <span className="edition-line" />
            {t.edition}
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-art-top">
            <span>{t.featured}</span>
            <span>01 / 03</span>
          </div>
          <div className="art-orbit" aria-hidden="true" />
          <div className="art-star" aria-hidden="true">
            ✳
          </div>
          {themes[0] ? (
            <Link
              className="hero-workspace"
              href={`/themes/${themes[0].id}`}
              aria-label={`${t.view}: ${themes[0].name[locale]}`}
            >
              <Workspace theme={themes[0]} t={t} />
            </Link>
          ) : (
            <div className="hero-placeholder" aria-hidden="true">
              V
            </div>
          )}
          <div className="hero-art-bottom">
            <div>
              <span className="eyebrow">{t.featuredNote}</span>
              <Link href="/themes/paper-studio">
                Paper Studio <ArrowUpRight size={19} />
              </Link>
            </div>
            <span className="round-seal" aria-hidden="true">
              V<br />
              <small>STUDIO</small>
            </span>
          </div>
        </div>
      </section>
      <div className="ticker">
        <span>CODEX, WITH CHARACTER</span>
        <span>✳</span>
        <span>
          {locale === 'zh' ? '让日常工作，也有自己的美学' : 'A LITTLE MORE YOU. EVERY DAY.'}
        </span>
        <span>✳</span>
        <span>THOUGHTFULLY CURATED</span>
        <span>✳</span>
        <span>CODEX, WITH CHARACTER</span>
      </div>
      <section id="collection" className="container collection">
        <div className="section-heading">
          <div>
            <p className="eyebrow">01 — {t.explore}</p>
            <h2>{t.collectionTitle}</h2>
            <p>{t.collectionIntro}</p>
          </div>
          <span className="section-number">(003)</span>
        </div>
        {loadState || <Catalog themes={themes} {...cardProps} />}
      </section>
      <section className="manifesto container">
        <div>
          <p className="eyebrow">{t.manifestoLabel}</p>
          <h2>
            {t.manifestoTitle.split('\n').map((line, index) => (
              <span key={line}>
                {line}
                {index === 0 && <br />}
              </span>
            ))}
          </h2>
          <p>{t.manifestoBody}</p>
          <Link href="/about" className="text-link">
            {t.about}
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="principles">
          {[1, 2, 3].map((number) => (
            <div className="principle" key={number}>
              <span>0{number}</span>
              <div>
                <h3>{t[`feature${number}` as keyof Messages]}</h3>
                <p>{t[`feature${number}Body` as keyof Messages]}</p>
              </div>
              <ArrowUpRight size={20} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
