'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
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
    senha: z.string().min(6, { message: 'Mínimo 6 caracteres' }),
    confirmarSenha: z.string().min(6, { message: 'Confirme a senha' }),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    path: ['confirmarSenha'],
    message: 'As senhas não coincidem',
  })

type FormValues = z.infer<typeof formSchema>

export default function CadastroAgenteLicenciadoPage() {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema) })

  async function onSubmit(data: FormValues) {
    setErrorMessage(null)

    try {
      const response = await fetch('/api/register/de-agentes-licenciados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.senha,
        redirect: false,
      })

      if (signInResult?.error) {
        setErrorMessage(
          'Conta criada, mas não foi possível iniciar sua sessão. Tente fazer login manualmente.',
        )
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
        <h1 className="mb-8 text-3xl font-bold">Cadastro de Agente/Empresário</h1>
        <div className="mb-8">
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

          <Card className="border-none bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
            <CardHeader>
              <CardTitle>Termos & compliance</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Label className="flex items-center gap-2">
                <input type="checkbox" {...form.register('possuiLicenca')} className="h-4 w-4" />
                <span>Declaro possuir licença válida para atuar como agente/intermediário</span>
                {form.formState.errors.possuiLicenca && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.possuiLicenca.message}
                  </p>
                )}
              </Label>
              <Label className="flex items-center gap-2">
                <input type="checkbox" {...form.register('aceitaRemuneracao')} className="h-4 w-4" />
                <span>Aceito os Termos de Remuneração e Taxas do Serviço</span>
                {form.formState.errors.aceitaRemuneracao && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.aceitaRemuneracao.message}
                  </p>
                )}
              </Label>
              <Label className="flex items-center gap-2">
                <input type="checkbox" {...form.register('termos')} className="h-4 w-4" />
                <span>Li e aceito os Termos de Uso e a Política de Privacidade</span>
                {form.formState.errors.termos && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.termos.message}
                  </p>
                )}
              </Label>
            </CardContent>
          </Card>

          <Card className="border-none bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
            <CardHeader>
              <CardTitle>Dados de acesso</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
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

          <div>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Enviando...' : 'Criar conta'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}

