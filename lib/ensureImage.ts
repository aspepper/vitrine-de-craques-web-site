import fs from 'fs';
import path from 'path';

export function ensureImage(
  relPath: string,
  slug: string,
  nodeName: string
): string {
  const cleaned = relPath.replace(/^\/+/, '');
  const filePath = path.join(process.cwd(), 'public', cleaned);
  if (!fs.existsSync(filePath)) {
    console.warn(
      `exporte do Figma: ${slug}/${nodeName} para /public/${cleaned} (WEBP/JPG para fotos; SVG para ícones/logos)`
    );
  }
  return '/' + cleaned;
}
