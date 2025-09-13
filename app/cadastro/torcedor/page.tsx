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
  nome: z.string().min(1, { message: 'Nome obrigatório' }),
  email: z.string().email({ message: 'Email inválido' }),
  clube: z.string().min(1, { message: 'Clube obrigatório' }),
  notifEmail: z.boolean().optional(),
  notifWhatsapp: z.boolean().optional(),
  termos: z.boolean().refine(v => v, { message: 'Obrigatório' }),
})

type FormValues = z.infer<typeof formSchema>

export default function CadastroTorcedorPage() {
  const router = useRouter()
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema) })

  function onSubmit(data: FormValues) {
    console.log(data)
    router.push('/')
  }

    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <main className="container mx-auto flex-grow py-12">
        <div className="mb-8 flex justify-center">
          <SocialAuth />
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados pessoais</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input id="nome" {...form.register('nome')} />
                {form.formState.errors.nome && (
                  <p className="text-sm text-destructive">{form.formState.errors.nome.message}</p>
                )}
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" {...form.register('email')} />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferências de clube</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="clube">Clube do coração</Label>
                <Input id="clube" {...form.register('clube')} />
                {form.formState.errors.clube && (
                  <p className="text-sm text-destructive">{form.formState.errors.clube.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Label className="flex items-center gap-2">
                <input type="checkbox" {...form.register('notifEmail')} className="h-4 w-4" />
                <span>Quero receber conteúdos exclusivos por e-mail</span>
              </Label>
              <Label className="flex items-center gap-2">
                <input type="checkbox" {...form.register('notifWhatsapp')} className="h-4 w-4" />
                <span>Quero receber conteúdos exclusivos por WhatsApp</span>
              </Label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacidade e consentimento (LGPD)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Label className="flex items-center gap-2">
                <input type="checkbox" {...form.register('termos')} className="h-4 w-4" />
                <span>Li e aceito os Termos de Uso e a Política de Privacidade</span>
              </Label>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit">Criar conta</Button>
          </div>
        </form>
        </main>
      </div>
    )
  }

