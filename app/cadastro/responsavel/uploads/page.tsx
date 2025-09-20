'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import SocialAuth from '@/components/SocialAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const formSchema = z.object({
  docResponsavel: z.any().optional(),
  docMenor: z.any().optional(),
  certidao: z.any().optional(),
  comprovante: z.any().optional(),
  consentimento1: z.boolean().refine(val => val, { message: 'Obrigatório' }),
  consentimento2: z.boolean().refine(val => val, { message: 'Obrigatório' }),
  consentimento3: z.boolean().refine(val => val, { message: 'Obrigatório' }),
})

type FormValues = z.infer<typeof formSchema>

export default function UploadsResponsavelPage() {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema) })

  function getFileName(value: FormValues[keyof FormValues]) {
    if (!value) return null
    if (value instanceof File) return value.name
    if (value instanceof FileList) {
      return value.length > 0 ? value[0].name : null
    }
    if (Array.isArray(value) && value.length > 0) {
      const file = value[0] as File
      return file?.name ?? null
    }
    return null
  }

  async function onSubmit(data: FormValues) {
    setErrorMessage(null)

    try {
      const response = await fetch('/api/register/responsavel/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docResponsavel: getFileName(data.docResponsavel),
          docMenor: getFileName(data.docMenor),
          certidao: getFileName(data.certidao),
          comprovante: getFileName(data.comprovante),
          consentimento1: data.consentimento1,
          consentimento2: data.consentimento2,
          consentimento3: data.consentimento3,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const message = typeof payload?.error === 'string'
          ? payload.error
          : 'Não foi possível salvar os documentos. Tente novamente.'
        setErrorMessage(message)
        return
      }

      router.push('/cadastro/sucesso')
    } catch (error) {
      console.error(error)
      setErrorMessage('Ocorreu um erro inesperado. Tente novamente mais tarde.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="container mx-auto flex-grow py-8 md:py-10">
        <h1 className="mb-8 text-center text-3xl font-bold">Uploads do responsável</h1>
        <div className="mb-8 flex justify-center">
          <SocialAuth />
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {errorMessage && (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {errorMessage}
            </p>
          )}
          <Card className="border-none bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
            <CardHeader>
              <CardTitle>Uploads obrigatórios</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="docResponsavel">RG ou CNH do Pai/Responsável</Label>
                <Input id="docResponsavel" type="file" {...form.register('docResponsavel')} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="docMenor">Documentos do menor</Label>
                <Input id="docMenor" type="file" {...form.register('docMenor')} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="certidao">Certidão de nascimento do menor</Label>
                <Input id="certidao" type="file" {...form.register('certidao')} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="comprovante">Comprovante de guarda/proteção</Label>
                <Input id="comprovante" type="file" {...form.register('comprovante')} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
            <CardHeader>
              <CardTitle>Consentimentos (obrigatórios)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Label className="flex items-center gap-2">
                <input type="checkbox" {...form.register('consentimento1')} className="h-4 w-4" />
                <span>Autorizo o tratamento e a publicação de imagens/vídeos</span>
                {form.formState.errors.consentimento1 && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.consentimento1.message}
                  </p>
                )}
              </Label>
              <Label className="flex items-center gap-2">
                <input type="checkbox" {...form.register('consentimento2')} className="h-4 w-4" />
                <span>Confirmo que tenho autorização do responsável do menor</span>
                {form.formState.errors.consentimento2 && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.consentimento2.message}
                  </p>
                )}
              </Label>
              <Label className="flex items-center gap-2">
                <input type="checkbox" {...form.register('consentimento3')} className="h-4 w-4" />
                <span>Li e aceito os Termos de Uso e a Política de Privacidade</span>
                {form.formState.errors.consentimento3 && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.consentimento3.message}
                  </p>
                )}
              </Label>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Enviar depois
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Salvando...' : 'Salvar e continuar'}
            </Button>
          </div>
        </form>
        </main>
      </div>
    )
  }

