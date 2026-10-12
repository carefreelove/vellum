const labels = {
  en: {
    '/': [
      'A space that feels like you.',
      'Explore, compare and collect three original Codex workspace looks.',
    ],
    '/guide': [
      'Field notes',
      'How previews, palette downloads and experimental native theme sharing work.',
    ],
    '/about': [
      'About Vellum',
      'An independent, open-source gallery of Codex workspace aesthetics.',
    ],
    '/compare': ['Compare', 'Compare two Codex workspace palettes side by side.'],
    '/saved': ['Your collection', 'Your locally saved workspace inspirations.'],
    missing: ['Page not found', 'This page or theme is not in the Vellum collection.'],
  },
  zh: {
    '/': ['让工作空间，更像你。', '探索、对比和收藏三款原创 Codex 工作空间主题。'],
    '/guide': ['使用手记', '了解示意预览、配色下载与实验性原生主题分享。'],
    '/about': ['关于 Vellum', '独立、开源的 Codex 工作空间美学主题馆。'],
    '/compare': ['主题对比', '并排比较两款 Codex 工作空间的配色与风格。'],
    '/saved': ['我的收藏', '保存在当前浏览器中的工作空间灵感。'],
    missing: ['页面未找到', 'Vellum 中没有找到这个页面或主题。'],
  },
};
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
export function renderPage(template, pathname, themes, origin) {
  const match = pathname.match(/^\/(en|zh)(?=\/|$)/);
  const locale = match?.[1] || 'en';
  const path = (match ? pathname.slice(match[0].length) : pathname).replace(/\/$/, '') || '/';
  let id;
  try {
    id = path.startsWith('/themes/') ? decodeURIComponent(path.slice(8)) : null;
  } catch {
    id = null;
  }
  const theme = themes.find((t) => t.id === id);
  const entry = theme ? [theme.name[locale], theme.description[locale]] : labels[locale][path];
  const status = entry ? 200 : 404;
  const [name, description] = entry || labels[locale].missing;
  const title = `${name} — Vellum`;
  const url = new URL(`/${locale}${path === '/' ? '' : path}`, origin).href;
  const alternates = ['en', 'zh']
    .map(
      (lang) =>
        `<link rel="alternate" hreflang="${lang === 'zh' ? 'zh-CN' : 'en'}" href="${escape(new URL(`/${lang}${path === '/' ? '' : path}`, origin).href)}" />`,
    )
    .join('\n');
  const meta = `<meta name="description" content="${escape(description)}" />
<link rel="canonical" href="${escape(url)}" />
${alternates}
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Vellum" />
<meta property="og:title" content="${escape(title)}" />
<meta property="og:description" content="${escape(description)}" />
<meta property="og:url" content="${escape(url)}" />
<meta property="og:locale" content="${locale === 'zh' ? 'zh_CN' : 'en_US'}" />
<meta name="twitter:card" content="summary" />
${status === 404 || path === '/saved' || path === '/compare' ? '<meta name="robots" content="noindex,follow" />' : ''}`;
  const html = template
    .replace(/<html lang="[^"]*"/, `<html lang="${locale === 'zh' ? 'zh-CN' : 'en'}"`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/<meta\s+name="description"[\s\S]*?\/>/, meta);
  return { html, status };
}
export function sitemap(origin, themes) {
  const paths = ['/', '/guide', '/about', ...themes.map((t) => `/themes/${t.id}`)];
  return (
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    ['en', 'zh']
      .flatMap((lang) =>
        paths.map(
          (path) =>
            `<url><loc>${escape(new URL(`/${lang}${path === '/' ? '' : path}`, origin).href)}</loc></url>`,
        ),
      )
      .join('') +
    '</urlset>'
  );
}
