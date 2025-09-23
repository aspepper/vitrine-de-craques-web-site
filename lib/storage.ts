import { promises as fs } from 'node:fs'
import path from 'node:path'

import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob'

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

const normalizedBaseUrl = storageEnv.publicBaseUrl?.replace(/\/+$/, '')

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

function buildFileUrl(key: string) {
  const normalizedKey = normalizeKey(key)

  if (normalizedBaseUrl) {
    return `${normalizedBaseUrl}/${normalizedKey}`
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

    return {
      key: normalizedKey,
      url: buildFileUrl(normalizedKey),
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
    return null
  }

  const normalized = normalizeKey(withoutQuery)
  return normalized || null
}

export function getPublicUrlForKey(key: string) {
  return buildFileUrl(key)
}

