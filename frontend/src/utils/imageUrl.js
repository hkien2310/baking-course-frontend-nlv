const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '');

export const PLACEHOLDER_IMAGE = `https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800&h=500`;

export function imageUrl(src, fallback = PLACEHOLDER_IMAGE) {
  if (!src || src === '' || src === 'null' || src === 'undefined') return fallback;

  // 1. Handle full URLs (Cloudinary, external, etc.)
  if (src.startsWith('http://') || src.startsWith('https://')) {
    // If it's a Cloudinary URL, we could add transformations here if needed
    // For now, just return as is
    return src;
  }

  // 2. Handle legacy paths from seed data (e.g., /baking/images/...)
  let cleanSrc = src;
  if (cleanSrc.startsWith('/baking/')) {
    cleanSrc = cleanSrc.replace('/baking/', '/');
  }

  // 3. Handle relative uploads
  if (cleanSrc.startsWith('/uploads/')) {
    return `${API_ORIGIN}${cleanSrc}`;
  }

  // 4. Handle public images
  if (cleanSrc.startsWith('/images/')) {
    const base = import.meta.env.BASE_URL || '/';
    return `${base}${cleanSrc.replace(/^\//, '')}`;
  }

  // 5. Fallback for other absolute paths
  if (cleanSrc.startsWith('/')) {
    const base = import.meta.env.BASE_URL || '/';
    return `${base}${cleanSrc.replace(/^\//, '')}`;
  }

  // 6. Default fallback
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${cleanSrc}`;
}
