const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '');

export function imageUrl(src, fallback = `${import.meta.env.BASE_URL}images/gallery/09.jpg`) {
  if (!src) return fallback;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  if (src.startsWith('/uploads/')) return `${API_ORIGIN}${src}`;
  if (src.startsWith('/images/')) return `${import.meta.env.BASE_URL}${src.replace(/^\//, '')}`;
  if (src.startsWith(import.meta.env.BASE_URL)) return src;
  if (src.startsWith('/')) return `${import.meta.env.BASE_URL}${src.replace(/^\//, '')}`;
  return `${import.meta.env.BASE_URL}${src}`;
}
