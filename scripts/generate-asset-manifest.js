const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '..', 'docs', 'figma_pages');
const routeManifestPath = path.join(__dirname, '..', 'docs', 'figma_route_manifest.json');

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function traverse(node, cb) {
  if (node.fills && Array.isArray(node.fills)) {
    if (node.fills.some(f => f.type === 'IMAGE')) {
      cb(node);
    }
  }
  if (node.children) {
    node.children.forEach(child => traverse(child, cb));
  }
}

function main() {
  const routeManifest = JSON.parse(fs.readFileSync(routeManifestPath, 'utf-8'));
  const routeMap = Object.fromEntries(
    routeManifest.map(r => [r.slug, r.suggested_route])
  );

  const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.json'));
  const manifest = [];
  for (const file of files) {
    const slug = path.basename(file, '.json');
    const filePath = path.join(pagesDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const route = routeMap[slug] || '/';
    const area = route === '/' ? 'home' : route.replace(/^\//, '').split('/')[0];
    traverse(data, node => {
      const nameSlug = slugify(node.name || 'image');
      const bbox = node.absoluteBoundingBox || { width: null, height: null };
      manifest.push({
        slug,
        nodeName: node.name,
        suggestedPath: `public/${area}/${nameSlug}.webp`,
        sizeHint: { width: bbox.width, height: bbox.height },
        usedOn: [route],
      });
    });
  }

  const outPath = path.join(__dirname, 'asset-manifest.json');
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));
}

main();
