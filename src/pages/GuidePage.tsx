import { ArrowUpRight, Plus } from 'lucide-react';
import { Link } from '../components/Link';
import { PageTitle } from '../components/ThemeUI';
import { useGallery } from '../hooks/useGallery';
import type { Messages } from '../i18n';

export function GuidePage() {
  const { t } = useGallery();
  return (
    <section className="container inner-page reading-page">
      <PageTitle eyebrow={t.guide} title={t.guideTitle} intro={t.guideIntro} />
      <div className="guide-steps">
        {[1, 2, 3, 4].map((number) => (
          <article key={number}>
            <span className="step-number">0{number}</span>
            <div>
              <h2>{t[`step${number}` as keyof Messages]}</h2>
              <p>{t[`step${number}Body` as keyof Messages]}</p>
            </div>
          </article>
        ))}
      </div>
      <h2 className="faq-heading">{t.faq}</h2>
      <div className="faqs">
        {[1, 2, 3, 4].map((number) => (
          <details key={number}>
            <summary>
              {t[`faq${number}` as keyof Messages]}
              <Plus size={18} />
            </summary>
            <p>{t[`faq${number}Body` as keyof Messages]}</p>
          </details>
        ))}
      </div>
      <Link href="/#collection" className="button">
        {t.browse}
        <ArrowUpRight size={17} />
      </Link>
    </section>
  );
}
