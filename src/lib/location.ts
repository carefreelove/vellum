import type { Locale } from '../types';

export function routeInfo(pathname: string) {
  const match = pathname.match(/^\/(en|zh)(?=\/|$)/);
  return {
    locale: match?.[1] as Locale | undefined,
    path: (match ? pathname.slice(match[0].length) : pathname).replace(/\/$/, '') || '/',
  };
}

export function localizedHref(href: string, locale: Locale): string {
  if (
    !href.startsWith('/') ||
    href.startsWith('//') ||
    /^\/(api|assets)\//.test(href) ||
    href === '/favicon.svg'
  )
    return href;
  const match = href.match(/^([^?#]*)(.*)$/)!;
  const path = routeInfo(match[1]).path;
  return `/${locale}${path === '/' ? '' : path}${match[2]}`;
}

export function setSearch(values: Record<string, string>, replace = false) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(values)) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  window.history[replace ? 'replaceState' : 'pushState'](null, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function parseComparison(value: string): string[] {
  return [...new Set(value.split(',').filter((id) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)))].slice(
    0,
    2,
  );
}
