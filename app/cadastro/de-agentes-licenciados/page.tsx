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
  cpf: z
    .string()
    .regex(/^\d{11}$/, { message: 'CPF deve ter 11 dígitos' }),
  email: z.string().email({ message: 'Email inválido' }),
  registroCbf: z
    .string()
    .min(1, { message: 'Registro CBF/BFM obrigatório' }),
  telefone: z.string().min(1, { message: 'Telefone obrigatório' }),
  registroFifa: z
    .string()
    .min(1, { message: 'Registro FIFA obrigatório' }),
  possuiLicenca: z.boolean().refine(v => v, { message: 'Obrigatório' }),
  aceitaRemuneracao: z.boolean().refine(v => v, { message: 'Obrigatório' }),
  termos: z.boolean().refine(v => v, { message: 'Obrigatório' }),
})

type FormValues = z.infer<typeof formSchema>

export default function CadastroAgenteLicenciadoPage() {
  const router = useRouter()
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema) })

  function onSubmit(data: FormValues) {
    console.log(data)
    router.push('/')
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="container mx-auto flex-grow py-12">
        <h1 className="mb-8 text-3xl font-bold">Cadastro de Agente/Empresário</h1>
        <div className="mb-8">
          <SocialAuth />
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do agente</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input id="nome" {...form.register('nome')} />
                {form.formState.errors.nome && (
                  <p className="text-sm text-destructive">{form.formState.errors.nome.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cpf">CPF (com 11 dígitos)</Label>
                <Input
                  id="cpf"
                  placeholder="00000000000"
                  {...form.register('cpf')}
                />
                {form.formState.errors.cpf && (
                  <p className="text-sm text-destructive">{form.formState.errors.cpf.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@gmail.com"
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="registroCbf">N° de registro CBF/BFM</Label>
                <Input
                  id="registroCbf"
                  placeholder="N° de registro CBF/BFM"
                  {...form.register('registroCbf')}
                />
                {form.formState.errors.registroCbf && (
                  <p className="text-sm text-destructive">{form.formState.errors.registroCbf.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  placeholder="ex: (11) 99999-9999"
                  {...form.register('telefone')}
                />
                {form.formState.errors.telefone && (
                  <p className="text-sm text-destructive">{form.formState.errors.telefone.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="registroFifa">N° FIFA</Label>
                <Input
                  id="registroFifa"
                  placeholder="N° FIFA"
                  {...form.register('registroFifa')}
                />
                {form.formState.errors.registroFifa && (
                  <p className="text-sm text-destructive">{form.formState.errors.registroFifa.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Termos & compliance</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Label className="flex items-center gap-2">
                <input type="checkbox" {...form.register('possuiLicenca')} className="h-4 w-4" />
                <span>Declaro possuir licença válida para atuar como agente/intermediário</span>
              </Label>
              <Label className="flex items-center gap-2">
                <input type="checkbox" {...form.register('aceitaRemuneracao')} className="h-4 w-4" />
                <span>Aceito os Termos de Remuneração e Taxas do Serviço</span>
              </Label>
              <Label className="flex items-center gap-2">
                <input type="checkbox" {...form.register('termos')} className="h-4 w-4" />
                <span>Li e aceito os Termos de Uso e a Política de Privacidade</span>
              </Label>
            </CardContent>
          </Card>

          <div>
            <Button type="submit">Criar conta</Button>
          </div>
        </form>
      </main>
    </div>
  )
}

