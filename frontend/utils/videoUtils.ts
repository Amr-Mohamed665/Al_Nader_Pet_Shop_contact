/**
 * Video detection and embed utilities.
 * Supports direct video files and embeddable video platforms.
 */

// File extensions that can be played with <video> tag
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.m4v', '.mkv'] as const;

export interface EmbedInfo {
  platform: string;
  id: string;
  embedUrl: string;
}

interface EmbedPattern {
  name: string;
  match: RegExp;
  embed: (id: string) => string;
}

// Patterns for embeddable video platforms
const EMBED_PATTERNS: EmbedPattern[] = [
  {
    name: 'youtube',
    match: /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]+)/i,
    embed: (id) => `https://www.youtube.com/embed/${id}?autoplay=1&mute=1`,
  },
  {
    name: 'vimeo',
    match: /vimeo\.com\/(?:video\/)?(\d+)/i,
    embed: (id) => `https://player.vimeo.com/video/${id}?autoplay=1&muted=1`,
  },
  {
    name: 'dailymotion',
    match: /dailymotion\.com\/video\/([\w-]+)/i,
    embed: (id) => `https://www.dailymotion.com/embed/video/${id}?autoplay=1&mute=1`,
  },
  {
    name: 'streamable',
    match: /streamable\.com\/([\w-]+)/i,
    embed: (id) => `https://streamable.com/e/${id}`,
  },
];

/**
 * Check if a URL is a direct video file (playable via <video> tag).
 */
export function isDirectVideo(url: string | null | undefined): boolean {
  if (!url) return false;
  const lower = url.toLowerCase().split('?')[0];
  return VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext)) || lower.includes('/video/upload/');
}

/**
 * Check if a URL is an embeddable video platform link.
 * Returns the matched EmbedInfo object or null.
 */
export function getEmbedInfo(url: string | null | undefined): EmbedInfo | null {
  if (!url) return null;
  for (const pattern of EMBED_PATTERNS) {
    const match = url.match(pattern.match);
    if (match?.[1]) {
      return {
        platform: pattern.name,
        id: match[1],
        embedUrl: pattern.embed(match[1]),
      };
    }
  }
  return null;
}

/**
 * Check if a URL is any kind of video (direct file or embeddable link).
 */
export function isVideo(url: string | null | undefined): boolean {
  return isDirectVideo(url) || !!getEmbedInfo(url);
}
