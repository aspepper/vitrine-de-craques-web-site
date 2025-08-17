"use client";

import { useState } from 'react';
import { PlayCircle } from 'lucide-react';

interface YouTubePlayerProps {
  videoId: string;
  className?: string;
}

export default function YouTubePlayer({ videoId, className }: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  if (isPlaying) {
    return (
      <div className={`aspect-video w-full overflow-hidden rounded-2xl ${className}`}>
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  return (
    <div
      className={`relative aspect-video w-full cursor-pointer overflow-hidden rounded-2xl group ${className}`}
      onClick={() => setIsPlaying(true)}
      style={{ backgroundImage: `url(${thumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <PlayCircle className="h-20 w-20 text-white/80 group-hover:text-white group-hover:scale-110 transition-all" />
      </div>
    </div>
  );
}
