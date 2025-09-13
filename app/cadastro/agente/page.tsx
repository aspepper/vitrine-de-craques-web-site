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
  cpf: z.string().min(1, { message: 'CPF obrigatório' }),
  email: z.string().email({ message: 'Email inválido' }),
  telefone: z.string().min(1, { message: 'Telefone obrigatório' }),
  licenca: z.string().min(1, { message: 'Licença obrigatória' }),
  registroFifa: z.string().optional(),
  possuiLicenca: z.boolean().refine(v => v, { message: 'Obrigatório' }),
  aceitaRemuneracao: z.boolean().refine(v => v, { message: 'Obrigatório' }),
  termos: z.boolean().refine(v => v, { message: 'Obrigatório' }),
})

type FormValues = z.infer<typeof formSchema>

export default function CadastroAgentePage() {
  const router = useRouter()
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema) })

  function onSubmit(data: FormValues) {
    console.log(data)
    router.push('/')
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="container mx-auto flex-grow py-12">
        <h1 className="mb-8 text-center text-3xl font-bold">Cadastro de Agente/Empresário</h1>
        <div className="mb-8 flex justify-center">
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
                <Label htmlFor="cpf">CPF (ou passaporte)</Label>
                <Input id="cpf" {...form.register('cpf')} />
                {form.formState.errors.cpf && (
                  <p className="text-sm text-destructive">{form.formState.errors.cpf.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" {...form.register('email')} />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telefone">Telefone/WhatsApp</Label>
                <Input id="telefone" {...form.register('telefone')} />
                {form.formState.errors.telefone && (
                  <p className="text-sm text-destructive">{form.formState.errors.telefone.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="licenca">Número da licença CBF</Label>
                <Input id="licenca" {...form.register('licenca')} />
                {form.formState.errors.licenca && (
                  <p className="text-sm text-destructive">{form.formState.errors.licenca.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="registroFifa">Registro FIFA (opcional)</Label>
                <Input id="registroFifa" {...form.register('registroFifa')} />
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

          <div className="flex justify-end">
            <Button type="submit">Criar conta</Button>
          </div>
        </form>
      </main>
    </div>
  )
}

