import type { AnchorHTMLAttributes } from 'react';
import { useGallery } from '../hooks/useGallery';
import { localizedHref } from '../lib/location';

export function Link({ href = '#', ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { locale, activeCompared } = useGallery();
  if (href === '/compare') href += `?themes=${activeCompared.join(',')}`;
  return <a {...props} href={localizedHref(href, locale)} />;
}
