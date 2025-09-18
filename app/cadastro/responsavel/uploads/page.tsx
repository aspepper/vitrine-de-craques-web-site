'use client'

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
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema) })

  function onSubmit(data: FormValues) {
    console.log(data)
    router.push('/')
  }

    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <main className="container mx-auto flex-grow py-12">
        <h1 className="mb-8 text-center text-3xl font-bold">Uploads do responsável</h1>
        <div className="mb-8 flex justify-center">
          <SocialAuth />
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              </Label>
              <Label className="flex items-center gap-2">
                <input type="checkbox" {...form.register('consentimento2')} className="h-4 w-4" />
                <span>Confirmo que tenho autorização do responsável do menor</span>
              </Label>
              <Label className="flex items-center gap-2">
                <input type="checkbox" {...form.register('consentimento3')} className="h-4 w-4" />
                <span>Li e aceito os Termos de Uso e a Política de Privacidade</span>
              </Label>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Enviar depois
            </Button>
            <Button type="submit">Salvar e continuar</Button>
          </div>
        </form>
        </main>
      </div>
    )
  }

