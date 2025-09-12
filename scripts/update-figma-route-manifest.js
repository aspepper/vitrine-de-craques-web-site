#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const figmaDir = path.join(process.cwd(), 'docs', 'figma_pages')
const files = fs
  .readdirSync(figmaDir)
  .filter((f) => f.endsWith('.json') && f !== 'index.json')

const singularToPlural = {
  agente: 'agentes',
  atleta: 'atletas',
  clube: 'clubes',
  confederacao: 'confederacoes',
  noticia: 'noticias',
  game: 'games',
}

function slugToRoute(slug) {
  if (slug === 'home' || slug === 'home-logado') return '/'
  if (slug === 'feeds') return '/feed'
  if (slug === 'upload-de-videos') return '/upload'
  if (slug === 'registrar-escolha-perfil') return '/registrar-escolha-perfil'
  if (slug === 'perfil' || slug === 'login') return `/${slug}`
  if (slug === 'sobre' || slug === 'privacidade') return `/${slug}`
  if (slug.startsWith('cadastro-')) return `/cadastro/${slug.replace('cadastro-', '')}`
  if (slug.endsWith('-grid')) return `/${slug.replace('-grid', '')}`
  if (slug.endsWith('-lista')) return `/${slug.replace('-lista', '')}`
  if (slug.endsWith('-detalhe') || slug.endsWith('-perfil')) {
    const base = slug.replace(/-(detalhe|perfil)$/i, '')
    const plural = singularToPlural[base]
    if (plural) return `/${plural}/[id]`
  }
  return `/${slug}`
}

function matchSegment(dir, seg) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  // direct match
  let entry = entries.find((e) => e.isDirectory() && e.name === seg)
  if (entry) return path.join(dir, entry.name)
  // dynamic match
  entry = entries.find((e) => e.isDirectory() && e.name.startsWith('['))
  if (entry) return path.join(dir, entry.name)
  // search in route groups
  for (const group of entries.filter((e) => e.isDirectory() && e.name.startsWith('('))) {
    const res = matchSegment(path.join(dir, group.name), seg)
    if (res) return res
  }
  return null
}

function routeExists(route) {
  const appDir = path.join(process.cwd(), 'app')
  if (route === '/') return fs.existsSync(path.join(appDir, 'page.tsx'))
  const segments = route.slice(1).split('/')
  let dir = appDir
  for (const seg of segments) {
    const next = matchSegment(dir, seg)
    if (!next) return false
    dir = next
  }
  return fs.existsSync(path.join(dir, 'page.tsx'))
}

const manifest = files.map((file) => {
  const slug = path.basename(file, '.json')
  const suggested_route = slugToRoute(slug)
  const exists_in_project = routeExists(suggested_route)
  return { slug, suggested_route, exists_in_project }
})

const outPath = path.join('docs', 'figma_route_manifest.json')
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2))
console.log(`Updated manifest at ${outPath}`)
