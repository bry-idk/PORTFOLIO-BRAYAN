/**
 * Cache-busting version appended to local /media/* assets at runtime.
 * Keeps raw paths in src/data/* untouched so filesystem unit tests still
 * match public/media/* directly while forcing browsers to bypass stale
 * immutable caches from earlier deployments.
 */
export const MEDIA_CACHE_VERSION = '20261126d'

export function mediaUrl(src: string): string {
  if (!src || !src.startsWith('/media/')) {
    return src
  }
  const sep = src.includes('?') ? '&' : '?'
  return `${src}${sep}v=${MEDIA_CACHE_VERSION}`
}
