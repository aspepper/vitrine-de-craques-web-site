import { createReadStream } from 'node:fs'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'

import {
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectCommandOutput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob'

export class StorageFileNotFoundError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message)
    this.name = 'StorageFileNotFoundError'

    if (options && 'cause' in options) {
      ;(this as { cause?: unknown }).cause = options.cause
    }
  }
}

export function isStorageFileNotFoundError(
  error: unknown,
): error is StorageFileNotFoundError {
  return error instanceof StorageFileNotFoundError
}

function createNotFoundError(key: string, cause?: unknown) {
  return new StorageFileNotFoundError(`Storage object not found: ${key}`, { cause })
}

function looksLikeNotFoundError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false
  }

  const code = (error as { code?: string }).code
  if (typeof code === 'string') {
    const normalized = code.toUpperCase()
    if (
      normalized === 'ENOENT' ||
      normalized === 'BLOBNOTFOUND' ||
      normalized === 'RESOURCENOTFOUND' ||
      normalized === 'NOTFOUND' ||
      normalized === 'NOSUCHKEY'
    ) {
      return true
    }
  }

  const name = (error as { name?: string }).name
  if (typeof name === 'string') {
    const normalized = name.toUpperCase()
    if (normalized === 'NOSUCHKEY' || normalized === 'NOTFOUND') {
      return true
    }
  }

  const statusCode = (error as { statusCode?: number }).statusCode
  if (statusCode === 404) {
    return true
  }

  const detailsCode = (error as { details?: { errorCode?: string } }).details?.errorCode
  if (typeof detailsCode === 'string') {
    const normalized = detailsCode.toUpperCase()
    if (normalized === 'BLOBNOTFOUND' || normalized === 'RESOURCENOTFOUND') {
      return true
    }
  }

  const metadataStatus = (error as { $metadata?: { httpStatusCode?: number } }).$metadata
    ?.httpStatusCode
  if (metadataStatus === 404) {
    return true
  }

  const responseStatus = (error as { $response?: { statusCode?: number } }).$response?.statusCode
  if (responseStatus === 404) {
    return true
  }

  return false
}

function rethrowIfNotFound(error: unknown, key: string): never {
  if (looksLikeNotFoundError(error)) {
    throw createNotFoundError(key, error)
  }

  throw error instanceof Error ? error : new Error(String(error))
}

const storageEnv = {
  driver: process.env.STORAGE_DRIVER,
  publicBaseUrl:
    process.env.STORAGE_PUBLIC_BASE_URL ??
    process.env.R2_PUBLIC_BASE_URL ??
    process.env.AZURE_STORAGE_PUBLIC_BASE_URL,
  bucket: process.env.STORAGE_BUCKET ?? process.env.R2_BUCKET_NAME,
  endpoint:
    process.env.STORAGE_ENDPOINT ??
    process.env.R2_ENDPOINT ??
    (process.env.R2_ACCOUNT_ID
      ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
      : undefined),
  region: process.env.STORAGE_REGION ?? process.env.R2_REGION ?? 'auto',
  accessKeyId: process.env.STORAGE_ACCESS_KEY_ID ?? process.env.R2_ACCESS_KEY_ID,
  secretAccessKey:
    process.env.STORAGE_SECRET_ACCESS_KEY ?? process.env.R2_SECRET_ACCESS_KEY,
  accountId: process.env.R2_ACCOUNT_ID,
  azureConnectionString:
    process.env.AZURE_STORAGE_CONNECTION_STRING ??
    process.env.STORAGE_AZURE_CONNECTION_STRING,
  azureContainer:
    process.env.AZURE_STORAGE_CONTAINER ?? process.env.STORAGE_AZURE_CONTAINER,
}

const normalizedEndpoint = storageEnv.endpoint?.replace(/\/+$/, '')

function detectDriver(): 'local' | 's3' | 'r2' | 'azure' {
  if (storageEnv.driver) {
    return storageEnv.driver.toLowerCase() as 'local' | 's3' | 'r2' | 'azure'
  }

  if (storageEnv.azureConnectionString && storageEnv.azureContainer) {
    return 'azure'
  }

  if (storageEnv.bucket && normalizedEndpoint) {
    return normalizedEndpoint.includes('.r2.cloudflarestorage.com') || storageEnv.accountId
      ? 'r2'
      : 's3'
  }

  return 'local'
}

const driver = detectDriver()

export type StorageDriver = 'local' | 's3' | 'r2' | 'azure'

export function getStorageDriver(): StorageDriver {
  return driver
}

const normalizedBaseUrl = storageEnv.publicBaseUrl?.replace(/\/+$/, '')

function buildDefaultR2PublicBaseUrl() {
  if (!storageEnv.accountId || !storageEnv.bucket) {
    return null
  }

  // Cloudflare R2 buckets are publicly accessible through the account endpoint
  // using the path-style URL: https://<accountId>.r2.cloudflarestorage.com/<bucket>/<key>
  return `https://${storageEnv.accountId}.r2.cloudflarestorage.com/${storageEnv.bucket}`
}

const fallbackR2BaseUrl =
  normalizedBaseUrl || (driver === 'r2' ? buildDefaultR2PublicBaseUrl() : null)

let inferredAzureBaseUrl: string | null = null

if (!normalizedBaseUrl && storageEnv.azureConnectionString && storageEnv.azureContainer) {
  try {
    const azureService = BlobServiceClient.fromConnectionString(storageEnv.azureConnectionString)
    const containerUrl = azureService.getContainerClient(storageEnv.azureContainer).url
    inferredAzureBaseUrl = containerUrl.replace(/\/+$/, '')
  } catch (error) {
    console.warn(
      'Failed to infer Azure Blob base URL:',
      error instanceof Error ? error.message : error,
    )
  }
}

let s3Client: S3Client | null = null
let azureContainerClient: ContainerClient | null = null

function ensureS3Client() {
  if (!s3Client) {
    if (!storageEnv.bucket || !normalizedEndpoint || !storageEnv.accessKeyId || !storageEnv.secretAccessKey) {
      throw new Error('Storage (S3) is not properly configured')
    }

    const forcePathStyle = driver === 'r2' || normalizedEndpoint.includes('.r2.cloudflarestorage.com')

    s3Client = new S3Client({
      region: storageEnv.region,
      endpoint: normalizedEndpoint,
      forcePathStyle,
      disableHostPrefix: true,
      credentials: {
        accessKeyId: storageEnv.accessKeyId,
        secretAccessKey: storageEnv.secretAccessKey,
      },
    })
  }

  return s3Client
}

async function ensureAzureContainerClient() {
  if (!azureContainerClient) {
    if (!storageEnv.azureConnectionString || !storageEnv.azureContainer) {
      throw new Error('Storage (Azure Blob) is not properly configured')
    }

    const service = BlobServiceClient.fromConnectionString(storageEnv.azureConnectionString)
    const container = service.getContainerClient(storageEnv.azureContainer)
    await container.createIfNotExists()
    azureContainerClient = container
  }

  return azureContainerClient
}

function normalizeKey(key: string) {
  const sanitized = key.replace(/\\/g, '/')
  const normalized = path.posix.normalize(`/${sanitized}`)
  return normalized.replace(/^\/+/, '')
}

export function normalizeStorageKey(key: string) {
  return normalizeKey(key)
}

function buildFileUrl(key: string) {
  const normalizedKey = normalizeKey(key)

  if (normalizedBaseUrl) {
    return `${normalizedBaseUrl}/${normalizedKey}`
  }

  if (driver === 'r2' && fallbackR2BaseUrl) {
    return `${fallbackR2BaseUrl.replace(/\/+$/, '')}/${normalizedKey}`
  }

  if (driver === 'azure' && inferredAzureBaseUrl) {
    return `${inferredAzureBaseUrl}/${normalizedKey}`
  }

  if (driver === 'local') {
    return `/${normalizedKey}`
  }

  throw new Error(
    driver === 'r2'
      ? 'Configure a URL pública para o R2 utilizando STORAGE_PUBLIC_BASE_URL ou R2_PUBLIC_BASE_URL'
      : 'STORAGE_PUBLIC_BASE_URL must be configured for non-local storage drivers',
  )
}

function resolveFilePath(key: string) {
  const normalizedKey = normalizeKey(key)
  return path.join(process.cwd(), 'public', normalizedKey)
}

export async function uploadFile({
  key,
  data,
  contentType,
  cacheControl,
}: {
  key: string
  data: Buffer | Uint8Array | string
  contentType?: string
  cacheControl?: string
}) {
  const normalizedKey = normalizeKey(key)

  if (driver === 'local') {
    const filePath = resolveFilePath(normalizedKey)
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, data)

    return {
      key: normalizedKey,
      url: buildFileUrl(normalizedKey),
    }
  }

  if (driver === 'azure') {
    const container = await ensureAzureContainerClient()
    const blob = container.getBlockBlobClient(normalizedKey)
    const azureData = typeof data === 'string' ? Buffer.from(data) : data
    await blob.uploadData(azureData, {
      blobHTTPHeaders: {
        blobContentType: contentType,
        blobCacheControl: cacheControl,
      },
    })

    const publicUrl = normalizedBaseUrl
      ? buildFileUrl(normalizedKey)
      : blob.url

    return {
      key: normalizedKey,
      url: publicUrl,
    }
  }

  // Treat 'r2' as 's3'
  const client = ensureS3Client()
  const bodyBuffer =
    typeof data === 'string'
      ? Buffer.from(data)
      : Buffer.isBuffer(data)
        ? data
        : Buffer.from(data)
  await client.send(
    new PutObjectCommand({
      Bucket: storageEnv.bucket!,
      Key: normalizedKey,
      Body: bodyBuffer,
      ContentType: contentType,
      CacheControl: cacheControl,
      ContentLength: bodyBuffer.byteLength,
    }),
  )

  return {
    key: normalizedKey,
    url: buildFileUrl(normalizedKey),
  }
}

export async function deleteFileByKey(key: string) {
  const normalizedKey = normalizeKey(key)

  if (!normalizedKey) return

  if (driver === 'local') {
    const filePath = resolveFilePath(normalizedKey)
    try {
      await fs.unlink(filePath)
    } catch (error) {
      const err = error as NodeJS.ErrnoException
      if (err.code !== 'ENOENT') {
        throw err
      }
    }
    return
  }

  if (driver === 'azure') {
    const container = await ensureAzureContainerClient()
    const blob = container.getBlockBlobClient(normalizedKey)
    await blob.deleteIfExists()
    return
  }

  const client = ensureS3Client()
  await client.send(
    new DeleteObjectCommand({
      Bucket: storageEnv.bucket!,
      Key: normalizedKey,
    }),
  )
}

export async function deleteFileByUrl(url?: string | null) {
  if (!url) return

  const key = extractKeyFromUrl(url)
  if (!key) return

  await deleteFileByKey(key)
}

export interface StorageStreamOptions {
  key: string
  range?: string
}

export interface StorageStreamResult {
  stream: Readable
  contentLength?: number
  contentType?: string
  contentRange?: string
  etag?: string
  lastModified?: Date
  totalSize?: number
}

function ensureNodeReadable(body: unknown): Readable {
  if (!body) {
    throw new Error('Storage response body is empty')
  }

  if (body instanceof Readable) {
    return body
  }

  if (typeof (body as any).pipe === 'function') {
    return body as Readable
  }

  if (typeof Readable.from === 'function') {
    return Readable.from(body as AsyncIterable<Uint8Array>)
  }

  throw new Error('Unsupported storage body stream type')
}

function parseRangeHeader(range: string, size: number) {
  const match = /^bytes=(\d*)-(\d*)$/i.exec(range)
  if (!match) {
    return null
  }

  let start = match[1] ? Number.parseInt(match[1], 10) : undefined
  let end = match[2] ? Number.parseInt(match[2], 10) : undefined

  if (Number.isNaN(start as number)) start = undefined
  if (Number.isNaN(end as number)) end = undefined

  if (start === undefined && end === undefined) {
    return null
  }

  if (start !== undefined && end !== undefined) {
    if (start > end) {
      return null
    }
  }

  if (start === undefined && end !== undefined) {
    if (end === 0) {
      return null
    }
    const length = Math.min(end, size)
    start = size - length
    end = size - 1
  }

  if (start !== undefined && end === undefined) {
    end = size - 1
  }

  start = start ?? 0
  end = end ?? size - 1

  if (start < 0 || end < 0 || start >= size) {
    return null
  }

  end = Math.min(end, size - 1)

  if (start > end) {
    return null
  }

  return { start, end }
}

export async function getFileStreamByKey({
  key,
  range,
}: StorageStreamOptions): Promise<StorageStreamResult> {
  const normalizedKey = normalizeKey(key)

  if (driver === 'local') {
    const filePath = resolveFilePath(normalizedKey)
    let stats: Awaited<ReturnType<typeof fs.stat>>

    try {
      stats = await fs.stat(filePath)
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
        throw createNotFoundError(normalizedKey, error)
      }

      throw error
    }

    const fileSize = stats.size

    if (range) {
      const parsed = parseRangeHeader(range, fileSize)
      if (!parsed) {
        throw Object.assign(new Error('Invalid range'), { code: 'ERR_INVALID_RANGE' })
      }

      const { start, end } = parsed
      const stream = createReadStream(filePath, { start, end })
      const contentLength = end - start + 1
      return {
        stream,
        contentLength,
        contentRange: `bytes ${start}-${end}/${fileSize}`,
        lastModified: stats.mtime,
        totalSize: fileSize,
      }
    }

    return {
      stream: createReadStream(filePath),
      contentLength: fileSize,
      lastModified: stats.mtime,
      totalSize: fileSize,
    }
  }

  if (driver === 'azure') {
    const container = await ensureAzureContainerClient()
    const blob = container.getBlockBlobClient(normalizedKey)

    try {
      if (range) {
        const properties = await blob.getProperties()
        const fileSize = properties.contentLength

        if (fileSize == null) {
          throw new Error('Unable to determine blob size for range request')
        }

        const parsed = parseRangeHeader(range, Number(fileSize))
        if (!parsed) {
          throw Object.assign(new Error('Invalid range'), { code: 'ERR_INVALID_RANGE' })
        }

        const { start, end } = parsed
        const count = end - start + 1
        const response = await blob.download(start, count)
        const stream = ensureNodeReadable(response.readableStreamBody)
        const contentLength = response.contentLength ?? count
        const totalSize = Number(fileSize)

        return {
          stream,
          contentLength,
          contentType: response.contentType ?? properties.contentType ?? undefined,
          contentRange:
            response.contentRange ?? `bytes ${start}-${start + contentLength - 1}/${totalSize}`,
          etag: response.etag ?? properties.etag ?? undefined,
          lastModified: response.lastModified ?? properties.lastModified ?? undefined,
          totalSize,
        }
      }

      const response = await blob.download()
      const stream = ensureNodeReadable(response.readableStreamBody)

      return {
        stream,
        contentLength: response.contentLength ?? undefined,
        contentType: response.contentType ?? undefined,
        contentRange: response.contentRange ?? undefined,
        etag: response.etag ?? undefined,
        lastModified: response.lastModified ?? undefined,
        totalSize: response.contentLength ?? undefined,
      }
    } catch (error) {
      rethrowIfNotFound(error, normalizedKey)
      throw error
    }
  }

  if (!storageEnv.bucket) {
    throw new Error('Storage bucket is not configured')
  }

  const client = ensureS3Client()
  let response: GetObjectCommandOutput

  try {
    response = await client.send(
      new GetObjectCommand({
        Bucket: storageEnv.bucket,
        Key: normalizedKey,
        Range: range,
      }),
    )
  } catch (error) {
    rethrowIfNotFound(error, normalizedKey)
    throw error
  }

  const stream = ensureNodeReadable(response.Body)
  const contentLength = response.ContentLength ?? undefined
  const contentType = response.ContentType ?? undefined
  const contentRange = response.ContentRange ?? undefined
  const etag = response.ETag ?? undefined
  const lastModified = response.LastModified

  let totalSize: number | undefined
  if (contentRange) {
    const match = /\/(\d+)$/.exec(contentRange)
    if (match) {
      totalSize = Number.parseInt(match[1], 10)
    }
  } else if (response.ContentLength != null) {
    totalSize = Number(response.ContentLength)
  }

  return {
    stream,
    contentLength: contentLength ?? undefined,
    contentType,
    contentRange,
    etag,
    lastModified,
    totalSize,
  }
}

export function extractKeyFromUrl(url: string) {
  if (!url) return null

  const [withoutQuery] = url.split(/[?#]/)

  if (withoutQuery.startsWith('http://') || withoutQuery.startsWith('https://')) {
    if (normalizedBaseUrl && withoutQuery.startsWith(normalizedBaseUrl)) {
      const suffix = withoutQuery.slice(normalizedBaseUrl.length)
      if (suffix === '' || suffix.startsWith('/')) {
        const normalized = normalizeKey(suffix)
        return normalized || null
      }
    }
    if (driver === 'r2' && fallbackR2BaseUrl) {
      const fallbackBase = fallbackR2BaseUrl.replace(/\/+$/, '')

      const candidates = [fallbackBase]

      if (storageEnv.bucket && storageEnv.accountId) {
        candidates.push(
          `https://${storageEnv.bucket}.${storageEnv.accountId}.r2.cloudflarestorage.com`,
        )
      }

      for (const candidate of candidates) {
        if (!candidate) continue
        if (withoutQuery.startsWith(candidate)) {
          const suffix = withoutQuery.slice(candidate.length)
          if (suffix === '' || suffix.startsWith('/')) {
            const normalized = normalizeKey(suffix)
            if (normalized) {
              return normalized
            }
          }
        }
      }
    }

    if (driver === 'azure' && inferredAzureBaseUrl && withoutQuery.startsWith(inferredAzureBaseUrl)) {
      const suffix = withoutQuery.slice(inferredAzureBaseUrl.length)
      if (suffix === '' || suffix.startsWith('/')) {
        const normalized = normalizeKey(suffix)
        return normalized || null
      }
    }
    return null
  }

  const normalized = normalizeKey(withoutQuery)
  return normalized || null
}

export function getPublicUrlForKey(key: string) {
  return buildFileUrl(key)
}

