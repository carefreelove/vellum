import { Github } from 'lucide-react';
import { Link } from '../components/Link';
import { PageTitle } from '../components/ThemeUI';
import { useGallery } from '../hooks/useGallery';

const sourceUrl = 'https://github.com/carefreelove/vellum';
export function AboutPage() {
  const { t } = useGallery();
  return (
    <section className="container inner-page reading-page">
      <PageTitle eyebrow={t.about} title={t.aboutTitle} intro={t.aboutIntro} />
      <div className="about-mark" aria-hidden="true">
        v<span>✳</span>
      </div>
      <p className="about-body">{t.aboutBody}</p>
      <h2>{t.aboutScope}</h2>
      <p className="about-body">{t.aboutScopeBody}</p>
      <h2>{t.privacy}</h2>
      <p className="about-body">{t.privacyBody}</p>
      <Link href={sourceUrl} className="button" target="_blank" rel="noreferrer">
        {t.source}
        <Github size={17} />
      </Link>
    </section>
  );
}
