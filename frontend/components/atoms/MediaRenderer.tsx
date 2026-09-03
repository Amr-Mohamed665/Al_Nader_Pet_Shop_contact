'use client';

import Image from 'next/image';
import { isDirectVideo, getEmbedInfo, isVideo } from '@/utils/videoUtils';
import type { ReactNode } from 'react';

interface MediaRendererProps {
  src: string | null | undefined;
  alt?: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  containerClassName?: string;
  controls?: boolean;
  autoPlay?: boolean;
  priority?: boolean;
  fallback?: ReactNode;
}

export default function MediaRenderer({
  src,
  alt = '',
  fill = true,
  sizes = '(max-width: 768px) 100vw, 50vw',
  className = '',
  containerClassName = '',
  controls = false,
  autoPlay = true,
  priority = false,
  fallback = null,
}: MediaRendererProps) {
  if (!src) {
    return (fallback as any) || (
      <div className={`h-full w-full flex items-center justify-center text-slate-400 font-extrabold text-3xl select-none ${containerClassName}`}>
        🐾
      </div>
    );
  }

  // Direct video file (.mp4, .webm, etc.)
  if (isDirectVideo(src)) {
    return (
      <video
        src={src}
        controls={controls}
        autoPlay={autoPlay}
        muted
        loop
        playsInline
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  // Embeddable platform (YouTube, Vimeo, etc.)
  const embedInfo = getEmbedInfo(src);
  if (embedInfo) {
    return (
      <iframe
        src={embedInfo.embedUrl}
        title={alt || `${embedInfo.platform} video`}
        className={`h-full w-full ${className}`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  // Default: image
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={`object-cover ${className}`}
      sizes={sizes}
      priority={priority}
      unoptimized
    />
  );
}

interface MediaThumbnailProps {
  src: string | null | undefined;
  alt?: string;
  className?: string;
}

export function MediaThumbnail({ src, alt, className = '' }: MediaThumbnailProps) {
  if (!src) {
    return (
      <div className={`h-full w-full flex items-center justify-center text-slate-400 font-bold text-xl select-none ${className}`}>
        🐾
      </div>
    );
  }

  if (isVideo(src)) {
    return (
      <div className={`relative h-full w-full bg-slate-900 flex items-center justify-center ${className}`}>
        <span className="text-xl">📹</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt || ''}
      fill
      className={`object-cover ${className}`}
      sizes="80px"
      unoptimized
    />
  );
}
