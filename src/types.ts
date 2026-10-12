export type Locale = 'zh' | 'en';
export type LocalizedText = Record<Locale, string>;
export type Theme = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  story: LocalizedText;
  mode: 'light' | 'dark';
  mood: 'minimal' | 'immersive' | 'organic';
  accent: 'warm' | 'cool' | 'natural';
  featured: boolean;
  order: number;
  palette: {
    background: string;
    surface: string;
    foreground: string;
    muted: string;
    accent: string;
  };
  author: string;
  version: string;
  status: 'concept';
  license: string;
  updatedAt: string;
  tags: Record<Locale, string[]>;
};
