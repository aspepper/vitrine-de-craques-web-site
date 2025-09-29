import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { errorResponse } from '@/lib/error'
import { buildVideoWhere } from '@/lib/video-filter-where'
import { parseVideoFilters } from '@/lib/video-filters'
import { deleteFileByUrl, extractKeyFromUrl, uploadFile } from '@/lib/storage'
import ffmpeg from 'fluent-ffmpeg'
import sharp from 'sharp'

const require = createRequire(import.meta.url)

let ffmpegBinaryPath = process.env.FFMPEG_PATH

if (!ffmpegBinaryPath) {
  try {
    const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg') as { path: string }
    ffmpegBinaryPath = ffmpegInstaller.path
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException
    const details =
      nodeError?.code === 'MODULE_NOT_FOUND'
        ?
            'O pacote opcional @ffmpeg-installer/ffmpeg não foi instalado para esta plataforma. '
        +
            'Certifique-se de ter o FFmpeg disponível no sistema ou defina a variável FFMPEG_PATH.'
        : 'Não foi possível carregar o instalador do FFmpeg.'

    console.warn(
      'FFmpeg installer package not available. Falling back to system ffmpeg binary.',
      details,
    )
  }
}

if (ffmpegBinaryPath) {
  ffmpeg.setFfmpegPath(ffmpegBinaryPath)
}

async function generateThumbnailFromVideo(videoBuffer: Buffer, originalName?: string) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'video-thumb-'))
  const extension = originalName ? path.extname(originalName) : ''
  const inputPath = path.join(tmpDir, `input${extension || '.mp4'}`)
  const outputPath = path.join(tmpDir, 'frame.jpg')

  try {
    await fs.writeFile(inputPath, videoBuffer)

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .seekInput(0.5)
        .frames(1)
        .outputOptions(['-qscale:v', '2'])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (error: Error) => reject(error))
        .run()
    })

    const frameBuffer = await fs.readFile(outputPath)
    const image = sharp(frameBuffer)
    const metadata = await image.metadata()
    const width = metadata.width ?? 0
    const height = metadata.height ?? 0

    if (!width || !height) {
      return frameBuffer
    }

    const targetRatio = 16 / 9
    let cropWidth = width
    let cropHeight = Math.round(cropWidth / targetRatio)

    if (cropHeight > height) {
      cropHeight = height
      cropWidth = Math.round(cropHeight * targetRatio)
    }

    const left = Math.max(0, Math.floor((width - cropWidth) / 2))
    const top = Math.max(0, Math.floor((height - cropHeight) / 2))

    return await image
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .toFormat('jpeg')
      .toBuffer()
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true })
  }
}

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

async function readVideoFile(videoUrl: string) {
  const [withoutQuery] = videoUrl.split(/[?#]/)
  if (!withoutQuery) {
    throw new Error('Invalid video URL')
  }

  if (withoutQuery.startsWith('http://') || withoutQuery.startsWith('https://')) {
    const response = await fetch(withoutQuery)
    if (!response.ok) {
      throw new Error(
        `Failed to download video for thumbnail regeneration (${response.status} ${response.statusText})`,
      )
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  const key = extractKeyFromUrl(videoUrl) ?? withoutQuery.replace(/^\/+/, '')
  const filePath = path.join(process.cwd(), 'public', key)

  return fs.readFile(filePath)
}

async function ensureVideoThumbnail<T extends { id: string; videoUrl: string; thumbnailUrl: string | null }>(
  video: T,
): Promise<T> {
  if (await thumbnailExists(video.thumbnailUrl)) {
    return video
  }

  try {
    const videoBuffer = await readVideoFile(video.videoUrl)
    const [withoutQuery] = video.videoUrl.split(/[?#]/)
    const originalName = withoutQuery ? path.basename(withoutQuery) : undefined
    const generatedThumbnail = await generateThumbnailFromVideo(videoBuffer, originalName)
    const thumbName = `${randomUUID()}.jpg`
    const thumbKey = `uploads/thumbnails/${thumbName}`
    const { url } = await uploadFile({
      key: thumbKey,
      data: generatedThumbnail,
      contentType: 'image/jpeg',
      cacheControl: 'public, max-age=31536000, immutable',
    })

    await deleteFileByUrl(video.thumbnailUrl)

    await prisma.video.update({
      where: { id: video.id },
      data: { thumbnailUrl: url },
    })

    return { ...video, thumbnailUrl: url }
  } catch (error) {
    console.error(`Failed to regenerate thumbnail for video ${video.id}`, error)
    return video
  }
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
      videosWithThumbnails.push(await ensureVideoThumbnail(video))
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
    let generatedThumbnail: Buffer | null = null

    if (!thumbFile) {
      try {
        generatedThumbnail = await generateThumbnailFromVideo(videoBytes, videoFile.name)
      } catch (error) {
        console.error('Failed to generate thumbnail from video', error)
      }
    }

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
    } else if (generatedThumbnail) {
      const thumbName = `${randomUUID()}.jpg`
      const thumbKey = `uploads/thumbnails/${thumbName}`
      const { url } = await uploadFile({
        key: thumbKey,
        data: generatedThumbnail,
        contentType: 'image/jpeg',
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
