'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import SocialAuth from '@/components/SocialAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const formSchema = z
  .object({
    nome: z.string().min(1, { message: 'Nome obrigatório' }),
    nascimento: z
      .string()
      .min(1, { message: 'Data de nascimento obrigatória' }),
    cpf: z.string().min(1, { message: 'CPF obrigatório' }),
    genero: z.string().min(1, { message: 'Sexo obrigatório' }),
    whatsapp: z.string().min(1, { message: 'Contato obrigatório' }),
    email: z.string().email({ message: 'Email inválido' }),
    senha: z.string().min(6, { message: 'Senha obrigatória' }),
    confirmarSenha: z.string().min(1, { message: 'Confirme a senha' }),
    clube: z.string().min(1, { message: 'Clube obrigatório' }),
    uf: z.string().min(1, { message: 'UF obrigatória' }),
    notifNovidades: z.boolean().optional(),
    notifJogos: z.boolean().optional(),
    notifEventos: z.boolean().optional(),
    notifAtletas: z.boolean().optional(),
    termos: z.boolean().refine((v) => v, { message: 'Obrigatório' }),
    lgpdWhatsappNoticias: z.boolean().optional(),
    lgpdWhatsappConvites: z.boolean().optional(),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    path: ['confirmarSenha'],
    message: 'As senhas não coincidem',
  })

type FormValues = z.infer<typeof formSchema>

export default function CadastroTorcedorPage() {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema) })

  async function onSubmit(data: FormValues) {
    setErrorMessage(null)

    try {
      const response = await fetch('/api/register/torcedor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const message = typeof payload?.error === 'string'
          ? payload.error
          : 'Não foi possível concluir o cadastro. Tente novamente.'
        setErrorMessage(message)
        return
      }

      router.push('/login')
    } catch (error) {
      console.error(error)
      setErrorMessage('Ocorreu um erro inesperado. Tente novamente mais tarde.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="container mx-auto flex-grow py-8 md:py-10">
        <h1 className="mb-2 text-left text-3xl font-bold">
          Cadastro Torcedor / Fan Clube
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Ou crie uma conta utilizando uma rede social, mas você terá que
          continuar o preenchimento.
        </p>
        <div className="mb-4 flex justify-center">
          <SocialAuth />
        </div>
        <div className="mb-8 text-center">
          <Link href="/login" className="text-sm text-primary underline">
            Já possuo uma conta
          </Link>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {errorMessage && (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {errorMessage}
            </p>
          )}
          <Card className="border-none bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
            <CardHeader>
              <CardTitle>Dados pessoais</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input id="nome" {...form.register('nome')} />
                {form.formState.errors.nome && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.nome.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nascimento">Data de nascimento</Label>
                <Input
                  id="nascimento"
                  type="date"
                  {...form.register('nascimento')}
                />
                {form.formState.errors.nascimento && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.nascimento.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" {...form.register('cpf')} />
                {form.formState.errors.cpf && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.cpf.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="genero">Sexo</Label>
                <select
                  id="genero"
                  className="flex h-14 w-full rounded-full border border-slate-200 bg-slate-50 px-5 text-base text-slate-900 shadow-sm transition focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                  {...form.register('genero')}
                >
                  <option value="">Selecione</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                  <option value="OUTRO">Outro</option>
                  <option value="NAO_INFORMAR">Prefiro não informar</option>
                </select>
                {form.formState.errors.genero && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.genero.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="whatsapp">Celular/WhatsApp</Label>
                <Input id="whatsapp" {...form.register('whatsapp')} />
                {form.formState.errors.whatsapp && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.whatsapp.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" {...form.register('email')} />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="senha">Senha</Label>
                <Input id="senha" type="password" {...form.register('senha')} />
                {form.formState.errors.senha && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.senha.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmarSenha">Confirmar senha</Label>
                <Input
                  id="confirmarSenha"
                  type="password"
                  {...form.register('confirmarSenha')}
                />
                {form.formState.errors.confirmarSenha && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.confirmarSenha.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
            <CardHeader>
              <CardTitle>Preferências de clube</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="clube">Clube do coração</Label>
                <Input id="clube" {...form.register('clube')} />
                {form.formState.errors.clube && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.clube.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="uf">Quero receber conteúdo por estado</Label>
                <Input id="uf" {...form.register('uf')} />
                {form.formState.errors.uf && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.uf.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...form.register('notifNovidades')}
                  className="h-4 w-4"
                />
                <span>Novidades do site</span>
              </Label>
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...form.register('notifJogos')}
                  className="h-4 w-4"
                />
                <span>Jogos e resultados</span>
              </Label>
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...form.register('notifEventos')}
                  className="h-4 w-4"
                />
                <span>Agenda e eventos</span>
              </Label>
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...form.register('notifAtletas')}
                  className="h-4 w-4"
                />
                <span>Atletas e categorias</span>
              </Label>
            </CardContent>
          </Card>

          <Card className="border-none bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
            <CardHeader>
              <CardTitle>Privacidade e consentimento (LGPD)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...form.register('termos')}
                  className="h-4 w-4"
                />
                <span>
                  Li e aceito os Termos de Uso e a Política de Privacidade
                </span>
              </Label>
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...form.register('lgpdWhatsappNoticias')}
                  className="h-4 w-4"
                />
                <span>Autorizo receber via WhatsApp novidades e conteúdos</span>
              </Label>
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...form.register('lgpdWhatsappConvites')}
                  className="h-4 w-4"
                />
                <span>
                  Autorizo ser contatado por WhatsApp com convites para Lives,
                  Podcasts e eventos
                </span>
              </Label>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Enviando...' : 'Criar conta'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
