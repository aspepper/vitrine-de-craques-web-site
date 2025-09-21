import prisma from "@/lib/db"
import { slugify } from "@/lib/slugify"

export async function generateUniqueNewsSlug(title: string, excludeId?: string) {
  const base = slugify(title)
  let candidate = base || `artigo-${Date.now()}`
  let suffix = 1

  while (true) {
    const existing = await prisma.news.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    })

    if (!existing) {
      return candidate
    }

    candidate = `${base}-${suffix}`
    suffix += 1
  }
}
