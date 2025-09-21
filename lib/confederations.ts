export function normalizeConfederationLogoUrl(logoUrl?: string | null): string | null {
  if (!logoUrl) {
    return null
  }

  const trimmed = logoUrl.trim()
  if (!trimmed) {
    return null
  }

  const lower = trimmed.toLowerCase()
  if (lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("data:")) {
    return trimmed
  }

  let normalized = trimmed

  if (normalized.startsWith("./")) {
    normalized = normalized.slice(2)
  }

  if (normalized.startsWith("public/")) {
    normalized = normalized.slice("public".length)
  }

  normalized = normalized.replace(/^\/+/g, "")

  return `/${normalized}`
}
