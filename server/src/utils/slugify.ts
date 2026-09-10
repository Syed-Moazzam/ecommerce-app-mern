export const slugify = (text: string): string =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const uniqueSlug = (text: string): string =>
  `${slugify(text)}-${Date.now().toString(36)}`;
