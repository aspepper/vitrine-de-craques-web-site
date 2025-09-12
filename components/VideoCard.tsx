import Link from 'next/link'
import { Card, CardContent } from './ui/card'
import Image from 'next/image'

interface Video {
  id: string
  title: string
  author: string
  thumbnailUrl: string
}

interface VideoCardProps {
  video: Video
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link href={`/player/${video.id}`}>
      <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
        <CardContent className="p-0">
          <div className="relative aspect-video">
            <Image
              src={video.thumbnailUrl}
              alt={`Thumbnail para ${video.title}`}
              layout="fill"
              objectFit="cover"
              loading="lazy"
            />
          </div>
          <div className="p-4">
            <h3 className="truncate text-lg font-bold">{video.title}</h3>
            <p className="text-sm text-muted-foreground">{video.author}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
