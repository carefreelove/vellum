import { ArrowUpRight } from 'lucide-react';
import type { Messages } from '../i18n';
import type { Theme } from '../types';
import { Link } from './Link';
export function PageTitle({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro: string;
}) {
  return (
    <div className="page-title">
      <p className="eyebrow">VELLUM / {eyebrow}</p>
      <h1>{title}</h1>
      <p>{intro}</p>
    </div>
  );
}
export function Empty({ title, body, t }: { title: string; body: string; t: Messages }) {
  return (
    <div className="empty">
      <span className="empty-star">✳</span>
      <h2>{title}</h2>
      <p>{body}</p>
      <Link href="/#collection" className="button">
        {t.browse}
        <ArrowUpRight size={16} />
      </Link>
    </div>
  );
}
export function Palette({
  theme,
  t,
  notify,
}: {
  theme: Theme;
  t: Messages;
  notify: (text: string) => void;
}) {
  return (
    <div className="palette">
      {Object.entries(theme.palette).map(([key, color]) => (
        <button
          className="palette-color"
          key={key}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(color);
              notify(`${t.copied} · ${color}`);
            } catch {
              notify(t.copyFailed);
            }
          }}
          aria-label={`${t[key as keyof Messages]} ${color}`}
        >
          <span style={{ background: color }} />
          <strong>{t[key as keyof Messages]}</strong>
          <code>{color}</code>
        </button>
      ))}
    </div>
  );
}
