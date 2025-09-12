'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

interface Video {
  id: string
  title: string
  videoUrl: string
  thumbnailUrl?: string | null
}

interface Props {
  video: Video
}

export function FeedVideoCard({ video }: Props) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const videoEl = ref.current
    if (!videoEl) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
            videoEl.play().catch(() => {})
          } else {
            videoEl.pause()
          }
        })
      },
      { threshold: [0, 0.7, 1] },
    )

    observer.observe(videoEl)
    return () => observer.disconnect()
  }, [])

  const ActionButton = ({ src, alt }: { src: string; alt: string }) => (
    <button
      className="rounded-full bg-white/30 p-2"
      onClick={() => console.log(alt)}
      type="button"
    >
      <Image src={src} alt={alt} width={32} height={32} loading="lazy" />
    </button>
  )

  return (
    <div className="relative aspect-[9/16] w-full max-w-sm">
      <video
        ref={ref}
        src={video.videoUrl}
        poster={video.thumbnailUrl || undefined}
        className="h-full w-full rounded-lg object-cover"
        loop
        muted
        playsInline
      />
      <div className="absolute bottom-10 right-2 flex flex-col gap-3">
        <ActionButton src="/icons/icon-like.svg" alt="Curtir" />
        <ActionButton src="/icons/icon-comment.svg" alt="Comentar" />
        <ActionButton src="/icons/icon-share.svg" alt="Compartilhar" />
        <ActionButton src="/icons/icon-report.svg" alt="Denunciar" />
      </div>
    </div>
  )
}
