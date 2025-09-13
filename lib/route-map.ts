const singularToPlural: Record<string, string> = {
  agente: 'agentes',
  atleta: 'atletas',
  clube: 'clubes',
  confederacao: 'confederacoes',
  noticia: 'noticias',
  game: 'games',
}

export function slugToRoute(slug: string): string {
  if (slug === 'home' || slug === 'home-logado') return '/'
  if (slug === 'feeds') return '/feed'
  if (slug === 'upload-de-videos') return '/upload'
  if (slug === 'registrar-escolha-perfil') return '/registrar-escolha-perfil'
  if (slug === 'perfil' || slug === 'login') return `/${slug}`
  if (slug === 'sobre' || slug === 'privacidade') return `/${slug}`
  if (slug.startsWith('cadastro-'))
    return `/cadastro/${slug.replace('cadastro-', '')}`
  if (slug.endsWith('-grid')) return `/${slug.replace('-grid', '')}`
  if (slug.endsWith('-lista')) return `/${slug.replace('-lista', '')}`
  if (slug.endsWith('-detalhe') || slug.endsWith('-perfil')) {
    const base = slug.replace(/-(detalhe|perfil)$/i, '')
    const plural = singularToPlural[base]
    if (plural) return `/${plural}/[id]`
  }
  return `/${slug}`
}

export function linkPropsFromNode(node: Record<string, any>): {
  href?: string
  as?: string
} {
  const props: { href?: string; as?: string } = {}
  if (typeof node['links_slug'] === 'string') {
    const route = slugToRoute(node['links_slug'])
    props.href = route
    props.as = route
  }
  if (typeof node['links_href'] === 'string') props.href = node['links_href']
  if (typeof node['links_as'] === 'string') props.as = node['links_as']
  return props
}
