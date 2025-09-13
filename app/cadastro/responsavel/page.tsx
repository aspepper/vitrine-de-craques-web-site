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
  responsavelNome: z.string().min(1, { message: 'Nome obrigatório' }),
  responsavelCpf: z.string().min(1, { message: 'CPF obrigatório' }),
  responsavelWhatsapp: z.string().min(1, { message: 'Contato obrigatório' }),
  responsavelEmail: z.string().email({ message: 'Email inválido' }),
  atletaNome: z.string().min(1, { message: 'Nome obrigatório' }),
  atletaCpf: z.string().min(1, { message: 'CPF obrigatório' }),
  atletaNascimento: z.string().min(1, { message: 'Data de nascimento obrigatória' }),
  verificacaoRg: z.boolean().optional(),
  verificacaoDocMenor: z.boolean().optional(),
  verificacaoComprovante: z.boolean().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function CadastroResponsavelPage() {
  const router = useRouter()
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema) })

  function onSubmit(data: FormValues) {
    console.log(data)
    router.push('/cadastro/responsavel/uploads')
  }

    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <main className="container mx-auto flex-grow py-12">
        <h1 className="mb-8 text-center text-3xl font-bold">Conta Familiar — Responsável + Atleta (menor de 18)</h1>
        <div className="mb-8 flex justify-center">
          <SocialAuth />
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Responsável</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="responsavelNome">Nome completo</Label>
                <Input id="responsavelNome" {...form.register('responsavelNome')} />
                {form.formState.errors.responsavelNome && (
                  <p className="text-sm text-destructive">{form.formState.errors.responsavelNome.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="responsavelCpf">CPF</Label>
                <Input id="responsavelCpf" {...form.register('responsavelCpf')} />
                {form.formState.errors.responsavelCpf && (
                  <p className="text-sm text-destructive">{form.formState.errors.responsavelCpf.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="responsavelWhatsapp">Celular/WhatsApp</Label>
                <Input id="responsavelWhatsapp" {...form.register('responsavelWhatsapp')} />
                {form.formState.errors.responsavelWhatsapp && (
                  <p className="text-sm text-destructive">{form.formState.errors.responsavelWhatsapp.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="responsavelEmail">E-mail</Label>
                <Input id="responsavelEmail" type="email" {...form.register('responsavelEmail')} />
                {form.formState.errors.responsavelEmail && (
                  <p className="text-sm text-destructive">{form.formState.errors.responsavelEmail.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados do Atleta (menor)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="atletaNome">Nome completo</Label>
                <Input id="atletaNome" {...form.register('atletaNome')} />
                {form.formState.errors.atletaNome && (
                  <p className="text-sm text-destructive">{form.formState.errors.atletaNome.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="atletaCpf">CPF</Label>
                <Input id="atletaCpf" {...form.register('atletaCpf')} />
                {form.formState.errors.atletaCpf && (
                  <p className="text-sm text-destructive">{form.formState.errors.atletaCpf.message}</p>
                )}
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="atletaNascimento">Data de nascimento</Label>
                <Input id="atletaNascimento" placeholder="DD/MM/AAAA" {...form.register('atletaNascimento')} />
                {form.formState.errors.atletaNascimento && (
                  <p className="text-sm text-destructive">{form.formState.errors.atletaNascimento.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verificações (upload posterior)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Label className="flex items-center gap-2">
                <input type="checkbox" {...form.register('verificacaoRg')} className="h-4 w-4" />
                <span>RG do responsável (frente e verso)</span>
              </Label>
              <Label className="flex items-center gap-2">
                <input type="checkbox" {...form.register('verificacaoDocMenor')} className="h-4 w-4" />
                <span>Documento do menor (frente e verso)</span>
              </Label>
              <Label className="flex items-center gap-2">
                <input type="checkbox" {...form.register('verificacaoComprovante')} className="h-4 w-4" />
                <span>Comprovante de guarda/tutela</span>
              </Label>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="submit">Continuar</Button>
          </div>
        </form>
        </main>
      </div>
    )
  }

