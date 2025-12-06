import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { errorResponse } from '@/lib/error'
import { buildVideoWhere } from '@/lib/video-filter-where'
import { parseVideoFilters } from '@/lib/video-filters'
import { extractKeyFromUrl, getPublicUrlForKey, uploadFile } from '@/lib/storage'

async function remoteFileExists(url: string) {
  try {
    const headResponse = await fetch(url, { method: 'HEAD' })
    if (headResponse.ok) {
      return true
    }

    if (headResponse.status === 405) {
      const getResponse = await fetch(url)
      return getResponse.ok
    }
  } catch (error) {
    console.warn(`Failed to verify remote file availability for ${url}`, error)
  }

  return false
}

async function thumbnailExists(thumbnailUrl: string | null) {
  if (!thumbnailUrl) {
    return false
  }

  const [withoutQuery] = thumbnailUrl.split(/[?#]/)
  if (!withoutQuery) {
    return false
  }

  if (withoutQuery.startsWith('http://') || withoutQuery.startsWith('https://')) {
    return remoteFileExists(withoutQuery)
  }

  const key = extractKeyFromUrl(thumbnailUrl) ?? withoutQuery.replace(/^\/+/, '')
  const filePath = path.join(process.cwd(), 'public', key)

  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

function rewriteStorageUrl(url: string | null | undefined) {
  if (!url) {
    return url ?? null
  }

  const [withoutQuery] = url.split(/[?#]/)
  if (withoutQuery.toLowerCase().includes('/api/videos/proxy')) {
    return url
  }

  const key = extractKeyFromUrl(url)
  if (!key) {
    return url
  }

  try {
    return getPublicUrlForKey(key)
  } catch (error) {
    console.warn(`Failed to rewrite storage URL for key ${key}`, error)
    return url
  }
}

async function ensureVideoThumbnail<T extends { id: string; videoUrl: string; thumbnailUrl: string | null }>(
  video: T,
): Promise<T> {
  if (await thumbnailExists(video.thumbnailUrl)) {
    return video
  }

  console.warn(`Thumbnail ausente para o vídeo ${video.id}; geração automática desabilitada.`)
  return video
}

function rewriteVideoAssetUrls<T extends { videoUrl: string; thumbnailUrl: string | null }>(video: T): T {
  const rewrittenVideoUrl = rewriteStorageUrl(video.videoUrl) ?? video.videoUrl
  const rewrittenThumbnailUrl = rewriteStorageUrl(video.thumbnailUrl) ?? video.thumbnailUrl

  if (rewrittenVideoUrl === video.videoUrl && rewrittenThumbnailUrl === video.thumbnailUrl) {
    return video
  }

  return {
    ...video,
    videoUrl: rewrittenVideoUrl,
    thumbnailUrl: rewrittenThumbnailUrl,
  }
}

async function ensureVideoPlaybackUrl<T extends { id: string; videoUrl: string }>(video: T): Promise<T> {
  const normalizedUrl = rewriteStorageUrl(video.videoUrl) ?? video.videoUrl
  const [normalizedWithoutQuery] = normalizedUrl.split(/[?#]/)
  if (normalizedWithoutQuery.toLowerCase().includes('/api/videos/proxy')) {
    return { ...video, videoUrl: normalizedUrl }
  }

  if (await remoteFileExists(normalizedUrl)) {
    if (normalizedUrl === video.videoUrl) {
      return video
    }

    return { ...video, videoUrl: normalizedUrl }
  }

  const key = extractKeyFromUrl(normalizedUrl) ?? extractKeyFromUrl(video.videoUrl)
  if (key) {
    console.warn(`Falling back to proxy URL for video ${video.id}`)
    return { ...video, videoUrl: `/api/videos/proxy?url=${encodeURIComponent(key)}` }
  }

  return { ...video, videoUrl: normalizedUrl }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const skip = parseInt(searchParams.get('skip') ?? '0', 10)
    const take = parseInt(searchParams.get('take') ?? '6', 10)
    const filters = parseVideoFilters(searchParams)

    const videos = await prisma.video.findMany({
      skip,
      take,
      where: buildVideoWhere(filters),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            profile: {
              select: {
                id: true,
                role: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    })
    const videosWithThumbnails: typeof videos = []

    for (const video of videos) {
      const withThumbnail = await ensureVideoThumbnail(video)
      const rewrittenAssets = rewriteVideoAssetUrls(withThumbnail)
      const playableVideo = await ensureVideoPlaybackUrl(rewrittenAssets)
      videosWithThumbnails.push(playableVideo)
    }

    return NextResponse.json(videosWithThumbnails)
  } catch (error) {
    return errorResponse(req, error, 'AO LISTAR VÍDEOS')
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.formData()
    const videoFile = data.get('video') as File | null
    const thumbFile = data.get('thumbnail') as File | null
    const title = data.get('title') as string
    const description = data.get('description') as string | undefined

    if (!videoFile || !title) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 })
    }

    const videoBytes = Buffer.from(await videoFile.arrayBuffer())

    const videoName = `${randomUUID()}-${videoFile.name}`
    const videoKey = `uploads/videos/${videoName}`
    const { url: videoUrl } = await uploadFile({
      key: videoKey,
      data: videoBytes,
      contentType: videoFile.type,
      cacheControl: 'public, max-age=31536000, immutable',
    })

    let thumbnailUrl: string | undefined
    if (thumbFile) {
      const thumbBytes = Buffer.from(await thumbFile.arrayBuffer())
      const thumbName = `${randomUUID()}-${thumbFile.name}`
      const thumbKey = `uploads/thumbnails/${thumbName}`
      const { url } = await uploadFile({
        key: thumbKey,
        data: thumbBytes,
        contentType: thumbFile.type,
        cacheControl: 'public, max-age=31536000, immutable',
      })
      thumbnailUrl = url
    }

    const video = await prisma.video.create({
      data: {
        title,
        description,
        videoUrl,
        thumbnailUrl,
        userId: session.user.id,
      },
    })

    return NextResponse.json(video)
  } catch (error) {
    return errorResponse(req, error, 'AO CRIAR VÍDEO')
  }
}