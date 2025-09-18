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
import { Textarea } from '@/components/ui/textarea'

const formSchema = z.object({
  responsavelNome: z.string().min(1, { message: 'Nome obrigatório' }),
  responsavelCpf: z.string().min(1, { message: 'CPF obrigatório' }),
  responsavelNascimento: z.string().min(1, {
    message: 'Data de nascimento obrigatória',
  }),
  responsavelGenero: z.string().min(1, { message: 'Gênero obrigatório' }),
  responsavelWhatsapp: z.string().min(1, { message: 'Contato obrigatório' }),
  responsavelEmail: z.string().email({ message: 'Email inválido' }),
  responsavelInstagram: z.string().optional(),
  atletaNome: z.string().min(1, { message: 'Nome obrigatório' }),
  atletaCpf: z.string().min(1, { message: 'CPF obrigatório' }),
  atletaNascimento: z.string().min(1, {
    message: 'Data de nascimento obrigatória',
  }),
  atletaGenero: z.string().min(1, { message: 'Gênero obrigatório' }),
  atletaEsporte: z.string().min(1, { message: 'Esporte obrigatório' }),
  atletaModalidade: z.string().min(1, { message: 'Modalidade obrigatória' }),
  atletaObservacoes: z.string().optional(),
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
      <main className="container mx-auto flex-grow py-8 md:py-10">
        <h1 className="mb-8 text-left text-3xl font-bold">Conta Familiar — Responsável + Atleta (menor de 18)</h1>
        <div className="mb-8 flex justify-center">
          <SocialAuth />
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-none bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
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
                <Label htmlFor="responsavelNascimento">Data de nascimento</Label>
                <Input
                  id="responsavelNascimento"
                  placeholder="DD/MM/AAAA"
                  {...form.register('responsavelNascimento')}
                />
                {form.formState.errors.responsavelNascimento && (
                  <p className="text-sm text-destructive">{form.formState.errors.responsavelNascimento.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="responsavelGenero">Gênero</Label>
                <Input id="responsavelGenero" {...form.register('responsavelGenero')} />
                {form.formState.errors.responsavelGenero && (
                  <p className="text-sm text-destructive">{form.formState.errors.responsavelGenero.message}</p>
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
                <Input
                  id="responsavelEmail"
                  type="email"
                  {...form.register('responsavelEmail')}
                />
                {form.formState.errors.responsavelEmail && (
                  <p className="text-sm text-destructive">{form.formState.errors.responsavelEmail.message}</p>
                )}
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="responsavelInstagram">Instagram</Label>
                <Input
                  id="responsavelInstagram"
                  placeholder="@usuario"
                  {...form.register('responsavelInstagram')}
                />
                {form.formState.errors.responsavelInstagram && (
                  <p className="text-sm text-destructive">{form.formState.errors.responsavelInstagram.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
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
              <div className="grid gap-2">
                <Label htmlFor="atletaNascimento">Data de nascimento</Label>
                <Input
                  id="atletaNascimento"
                  placeholder="DD/MM/AAAA"
                  {...form.register('atletaNascimento')}
                />
                {form.formState.errors.atletaNascimento && (
                  <p className="text-sm text-destructive">{form.formState.errors.atletaNascimento.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="atletaGenero">Gênero</Label>
                <Input id="atletaGenero" {...form.register('atletaGenero')} />
                {form.formState.errors.atletaGenero && (
                  <p className="text-sm text-destructive">{form.formState.errors.atletaGenero.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="atletaEsporte">Esporte principal</Label>
                <Input id="atletaEsporte" {...form.register('atletaEsporte')} />
                {form.formState.errors.atletaEsporte && (
                  <p className="text-sm text-destructive">{form.formState.errors.atletaEsporte.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="atletaModalidade">Modalidade</Label>
                <Input id="atletaModalidade" {...form.register('atletaModalidade')} />
                {form.formState.errors.atletaModalidade && (
                  <p className="text-sm text-destructive">{form.formState.errors.atletaModalidade.message}</p>
                )}
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="atletaObservacoes">Observações sobre o Atleta</Label>
                <Textarea
                  id="atletaObservacoes"
                  {...form.register('atletaObservacoes')}
                />
                {form.formState.errors.atletaObservacoes && (
                  <p className="text-sm text-destructive">{form.formState.errors.atletaObservacoes.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
            <CardHeader>
              <CardTitle>Verificações (upload posterior)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label>Foto (selfie)</Label>
                <Input disabled placeholder="N/A" />
              </div>
              <div className="grid gap-2">
                <Label>Comprovante (residência)</Label>
                <Input disabled placeholder="N/A" />
              </div>
              <div className="grid gap-2">
                <Label>Comprovante (identidade)</Label>
                <Input disabled placeholder="N/A" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-start">
            <Button type="submit">Enviar Documentos</Button>
          </div>
        </form>
        </main>
      </div>
    )
  }

