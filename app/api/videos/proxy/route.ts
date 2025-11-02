import { NextRequest, NextResponse } from 'next/server'
import { Readable } from 'node:stream'

import { errorResponse } from '@/lib/error'
import {
  extractKeyFromUrl,
  getFileStreamByKey,
  getStorageDriver,
  isStorageFileNotFoundError,
  normalizeStorageKey,
} from '@/lib/storage'

function nodeReadableToWebReadable(stream: Readable) {
  return Readable.toWeb(stream) as ReadableStream<Uint8Array>
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const input = searchParams.get('url')

  if (!input) {
    return NextResponse.json({ message: 'O parâmetro "url" é obrigatório.' }, { status: 400 })
  }

  const storageDriver = getStorageDriver()
  if (
    storageDriver !== 'r2' &&
    storageDriver !== 's3' &&
    storageDriver !== 'local' &&
    storageDriver !== 'azure'
  ) {
    return NextResponse.json(
      {
        message:
          'O proxy de vídeos só está disponível para armazenamentos S3/R2, Azure Blob ou local.',
      },
      { status: 500 },
    )
  }

  let key = extractKeyFromUrl(input)
  if (!key) {
    key = normalizeStorageKey(input)
  }

  if (!key) {
    return NextResponse.json({ message: 'Não foi possível determinar a chave do vídeo.' }, { status: 400 })
  }

  const range = request.headers.get('range') ?? undefined

  try {
    const { stream, contentLength, contentRange, contentType, etag, lastModified } =
      await getFileStreamByKey({ key, range })

    const headers = new Headers()
    headers.set('Accept-Ranges', 'bytes')

    if (contentType) {
      headers.set('Content-Type', contentType)
    }

    if (etag) {
      headers.set('ETag', etag)
    }

    if (lastModified) {
      headers.set('Last-Modified', lastModified.toUTCString())
    }

    if (contentRange) {
      headers.set('Content-Range', contentRange)
    }

    if (contentLength !== undefined) {
      headers.set('Content-Length', String(contentLength))
    }

    headers.set('Cache-Control', 'private, max-age=0, must-revalidate')

    const status = contentRange ? 206 : 200

    return new NextResponse(nodeReadableToWebReadable(stream), {
      status,
      headers,
    })
  } catch (error) {
    if (isStorageFileNotFoundError(error)) {
      return NextResponse.json({ message: 'Vídeo não encontrado.' }, { status: 404 })
    }

    if ((error as { code?: string }).code === 'ERR_INVALID_RANGE') {
      return NextResponse.json({ message: 'Faixa solicitada inválida.' }, { status: 416 })
    }

    return errorResponse(request, error, 'proxy-video')
  }
}

export const dynamic = 'force-dynamic'
