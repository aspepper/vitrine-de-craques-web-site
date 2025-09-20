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
    nomeClube: z.string().min(1, { message: 'Nome obrigatório' }),
    nomeFantasia: z.string().optional(),
    telefone: z.string().min(1, { message: 'Telefone obrigatório' }),
    emailClube: z.string().email({ message: 'Email inválido' }),
    uf: z.string().min(1, { message: 'UF obrigatória' }),
    cidade: z.string().min(1, { message: 'Cidade obrigatória' }),
    cnpj: z.string().min(1, { message: 'CNPJ obrigatório' }),
    inscricaoEstadual: z.string().optional(),
    representanteNome: z.string().min(1, { message: 'Nome obrigatório' }),
    representanteCpf: z.string().min(1, { message: 'CPF obrigatório' }),
    representanteEmail: z.string().email({ message: 'Email inválido' }),
    whatsapp: z.string().min(1, { message: 'Telefone obrigatório' }),
    termos: z.boolean().refine(v => v, { message: 'Obrigatório' }),
    senha: z.string().min(6, { message: 'Mínimo 6 caracteres' }),
    confirmarSenha: z.string().min(6, { message: 'Confirme a senha' }),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    path: ['confirmarSenha'],
    message: 'As senhas não coincidem',
  })

type FormValues = z.infer<typeof formSchema>

export default function CadastroClubePage() {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema) })

  async function onSubmit(data: FormValues) {
    setErrorMessage(null)

    try {
      const response = await fetch('/api/register/clube', {
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
        email: data.emailClube,
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
        <h1 className="mb-8 text-3xl font-bold">Cadastro Clube/Entidade Desportiva</h1>
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
              <CardTitle>Dados do clube</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="nomeClube">Nome do clube</Label>
                <Input id="nomeClube" {...form.register('nomeClube')} />
                {form.formState.errors.nomeClube && (
                  <p className="text-sm text-destructive">{form.formState.errors.nomeClube.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nomeFantasia">Nome opcional</Label>
                <Input id="nomeFantasia" {...form.register('nomeFantasia')} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" {...form.register('telefone')} />
                {form.formState.errors.telefone && (
                  <p className="text-sm text-destructive">{form.formState.errors.telefone.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="emailClube">E-mail do clube</Label>
                <Input id="emailClube" type="email" {...form.register('emailClube')} />
                {form.formState.errors.emailClube && (
                  <p className="text-sm text-destructive">{form.formState.errors.emailClube.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="uf">UF</Label>
                <Input id="uf" {...form.register('uf')} />
                {form.formState.errors.uf && (
                  <p className="text-sm text-destructive">{form.formState.errors.uf.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" {...form.register('cidade')} />
                {form.formState.errors.cidade && (
                  <p className="text-sm text-destructive">{form.formState.errors.cidade.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" {...form.register('cnpj')} />
                {form.formState.errors.cnpj && (
                  <p className="text-sm text-destructive">{form.formState.errors.cnpj.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="inscricaoEstadual">Inscrição estadual</Label>
                <Input id="inscricaoEstadual" {...form.register('inscricaoEstadual')} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
            <CardHeader>
              <CardTitle>Representante do clube</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="representanteNome">Nome</Label>
                <Input id="representanteNome" {...form.register('representanteNome')} />
                {form.formState.errors.representanteNome && (
                  <p className="text-sm text-destructive">{form.formState.errors.representanteNome.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="representanteCpf">CPF</Label>
                <Input id="representanteCpf" {...form.register('representanteCpf')} />
                {form.formState.errors.representanteCpf && (
                  <p className="text-sm text-destructive">{form.formState.errors.representanteCpf.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="representanteEmail">E-mail</Label>
                <Input id="representanteEmail" type="email" {...form.register('representanteEmail')} />
                {form.formState.errors.representanteEmail && (
                  <p className="text-sm text-destructive">{form.formState.errors.representanteEmail.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="whatsapp">Celular/WhatsApp</Label>
                <Input id="whatsapp" {...form.register('whatsapp')} />
                {form.formState.errors.whatsapp && (
                  <p className="text-sm text-destructive">{form.formState.errors.whatsapp.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Label className="flex items-center gap-2">
            <input id="termos" type="checkbox" className="h-4 w-4" {...form.register('termos')} />
            <span>Aceito os Termos de Uso e a Política de Privacidade</span>
            {form.formState.errors.termos && (
              <p className="text-sm text-destructive">
                {form.formState.errors.termos.message}
              </p>
            )}
          </Label>
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
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Enviando...' : 'Criar conta'}
          </Button>
        </form>
        </main>
      </div>
    )
  }

