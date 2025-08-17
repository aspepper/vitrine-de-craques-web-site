import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from './ui/card';

interface AlbumCardProps {
  href: string;
  imageUrl: string;
  name: string;
  details: string[];
}

export default function AlbumCard({ href, imageUrl, name, details }: AlbumCardProps) {
  return (
    <Link href={href} className="group block">
      <Card className="overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
        <div className="aspect-[4/5] relative bg-muted">
          <Image
            src={imageUrl}
            alt={`Foto de ${name}`}
            fill
            sizes="(max-width: 640px) 100vw, 250px"
            className="object-cover"
          />
        </div>
        <div className="p-4 border-t-4 border-primary">
          <h3 className="font-bold text-lg truncate">{name}</h3>
          {details.map((detail, index) => (
            <p key={index} className="text-sm text-muted-foreground truncate">{detail}</p>
          ))}
        </div>
      </Card>
    </Link>
  );
}
