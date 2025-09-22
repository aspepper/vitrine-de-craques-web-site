'use client'

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react'
import { useRouter } from 'next/navigation'
import Cropper, { type Area } from 'react-easy-crop'
import { Upload, UserRound, X } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

function dataUrlToImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', reject)
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = dataUrl
  })
}

async function getCroppedImage(dataUrl: string, cropArea: Area) {
  const image = await dataUrlToImage(dataUrl)
  const canvas = document.createElement('canvas')
  const size = 512
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas context não suportado')
  }

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'

  context.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    size,
    size,
  )

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Não foi possível gerar a imagem'))
        return
      }
      resolve(blob)
    }, 'image/webp', 0.92)
  })
}

function dispatchAvatarUpdated(url: string) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('profile-avatar-updated', { detail: url }))
}

interface ProfileAvatarUploaderProps {
  displayName: string | null | undefined
  initialAvatarUrl: string | null | undefined
}

export function ProfileAvatarUploader({ displayName, initialAvatarUrl }: ProfileAvatarUploaderProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl ?? null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [inlineError, setInlineError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const inlineErrorTimeout = useRef<number | null>(null)
  const router = useRouter()

  const label = displayName ?? 'Perfil'
  const fallback = (
    <AvatarFallback className="rounded-full bg-white/40 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-200">
      <UserRound aria-hidden className="h-12 w-12" />
      <span className="sr-only">{label}</span>
    </AvatarFallback>
  )

  const previewUrl = useMemo(() => {
    if (!avatarUrl) return null
    const bust = Date.now()
    return `${avatarUrl}?v=${bust}`
  }, [avatarUrl])

  useEffect(() => {
    const normalized = initialAvatarUrl ?? null
    setAvatarUrl((current) => (current === normalized ? current : normalized))
  }, [initialAvatarUrl])

  const clearInlineError = useCallback(() => {
    if (inlineErrorTimeout.current) {
      window.clearTimeout(inlineErrorTimeout.current)
      inlineErrorTimeout.current = null
    }
  }, [])

  const showInlineError = useCallback(
    (message: string) => {
      setInlineError(message)
      clearInlineError()
      inlineErrorTimeout.current = window.setTimeout(() => {
        setInlineError(null)
        inlineErrorTimeout.current = null
      }, 4000)
    },
    [clearInlineError],
  )

  useEffect(() => {
    return () => {
      clearInlineError()
    }
  }, [clearInlineError])

  const handleFileChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      showInlineError('Selecione um arquivo de imagem válido.')
      event.target.value = ''
      return
    }

    if (file.size > 6 * 1024 * 1024) {
      showInlineError('Escolha uma imagem com até 6MB.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      const result = reader.result
      if (typeof result === 'string') {
        setImageSrc(result)
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setError(null)
        setIsDialogOpen(true)
      }
    })
    reader.readAsDataURL(file)
  }, [showInlineError])

  const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels)
  }, [])

  const resetDialog = useCallback(() => {
    setIsDialogOpen(false)
    setImageSrc(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setError(null)
    clearInlineError()
    setInlineError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [clearInlineError])

  const handleSave = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) {
      setError('Selecione uma imagem e ajuste o recorte antes de salvar.')
      return
    }

    try {
      setIsSaving(true)
      const blob = await getCroppedImage(imageSrc, croppedAreaPixels)
      const file = new File([blob], 'avatar.webp', { type: 'image/webp' })
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        const message = data?.error ?? 'Não foi possível atualizar a foto de perfil.'
        throw new Error(message)
      }

      const data = (await response.json()) as { avatarUrl: string }
      const nextUrl = data.avatarUrl
      setAvatarUrl(nextUrl)
      dispatchAvatarUpdated(nextUrl)
      startTransition(() => {
        router.refresh()
      })
      resetDialog()
    } catch (uploadError) {
      console.error('Erro ao enviar avatar', uploadError)
      setError(uploadError instanceof Error ? uploadError.message : 'Falha ao atualizar a foto.')
    } finally {
      setIsSaving(false)
    }
  }, [croppedAreaPixels, imageSrc, resetDialog, router, startTransition])

  return (
    <div className="group relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-sky-400 to-cyan-500 p-[6px] shadow-[0_24px_48px_-28px_rgba(8,145,178,0.9)]">
      <Avatar className="h-full w-full">
        {previewUrl ? (
          <AvatarImage alt={label} src={previewUrl} />
        ) : initialAvatarUrl ? (
          <AvatarImage alt={label} src={initialAvatarUrl} />
        ) : null}
        {fallback}
      </Avatar>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:bg-slate-800 dark:text-slate-100"
        aria-label="Alterar foto de perfil"
      >
        <Upload className="h-5 w-5" aria-hidden />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
      />

      <Dialog open={isDialogOpen} onOpenChange={(open) => (!open ? resetDialog() : setIsDialogOpen(open))}>
        <DialogContent className="max-w-xl gap-6">
          <DialogHeader>
            <DialogTitle>Atualizar foto de perfil</DialogTitle>
            <DialogDescription>
              Ajuste a área visível da sua foto, aproximando ou afastando para um enquadramento perfeito.
            </DialogDescription>
          </DialogHeader>

          <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800">
            {imageSrc ? (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
                minZoom={1}
                maxZoom={4}
                cropShape="round"
                showGrid={false}
              />
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-300">
              Zoom
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Use o controle para aproximar</span>
            </label>
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 dark:bg-slate-700"
            />
          </div>

          {error ? (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              <X className="h-4 w-4" aria-hidden />
              <span>{error}</span>
            </div>
          ) : null}

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={resetDialog}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving || !imageSrc}>
              {isSaving ? 'Salvando...' : 'Salvar foto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {inlineError ? (
        <div className="absolute top-full z-10 mt-3 w-64 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-600 shadow-lg dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200" role="status" aria-live="polite">
          {inlineError}
        </div>
      ) : null}

      {isPending ? (
        <span className="absolute inset-0 rounded-full bg-white/40 backdrop-blur-sm dark:bg-slate-900/40" aria-hidden />
      ) : null}
    </div>
  )
}
