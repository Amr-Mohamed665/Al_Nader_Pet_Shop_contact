'use client';

import { isVideo, getEmbedInfo, isDirectVideo } from '@/utils/videoUtils';

interface BlogMediaProps {
  src?: string | null;
  alt: string;
  className?: string;
  autoPlay?: boolean;
}

export default function BlogMedia({
  src,
  alt,
  className = 'w-full h-full object-cover',
  autoPlay = false,
}: BlogMediaProps) {
  if (!src) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-purple-600 via-indigo-700 to-slate-900 flex flex-col items-center justify-center text-white p-4">
        <i className="fa-solid fa-newspaper text-3xl opacity-40 mb-1" />
        <span className="text-[10px] font-extrabold opacity-60 uppercase tracking-widest text-center">Al Nader Pet Care</span>
      </div>
    );
  }

  if (isVideo(src)) {
    const embedInfo = getEmbedInfo(src);
    if (embedInfo) {
      return (
        <iframe
          src={embedInfo.embedUrl}
          title={alt}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    if (isDirectVideo(src)) {
      return (
        <video
          src={src}
          controls={!autoPlay}
          autoPlay={autoPlay}
          muted={autoPlay}
          loop={autoPlay}
          playsInline
          className={`w-full h-full object-cover ${className}`}
        />
      );
    }
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        const target = e.currentTarget;
        target.style.display = 'none';
        if (target.parentElement) {
          target.parentElement.classList.add('bg-gradient-to-br', 'from-purple-600', 'to-indigo-800');
        }
      }}
    />
  );
}
