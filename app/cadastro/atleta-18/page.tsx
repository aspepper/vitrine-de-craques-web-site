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

const formSchema = z
  .object({
    nome: z.string().min(1, { message: 'Nome obrigatório' }),
    cpf: z.string().min(1, { message: 'CPF obrigatório' }),
    pais: z.string().min(1, { message: 'País obrigatório' }),
    uf: z.string().min(1, { message: 'UF obrigatório' }),
    altura: z.string().optional(),
    peso: z.string().optional(),
    posicao: z.string().min(1, { message: 'Posição obrigatória' }),
    perna: z.string().min(1, { message: 'Perna obrigatória' }),
    cidade: z.string().min(1, { message: 'Cidade obrigatória' }),
    email: z.string().email({ message: 'Email inválido' }),
    senha: z.string().min(6, { message: 'Mínimo 6 caracteres' }),
    confirmarSenha: z.string().min(6),
    termos: z.boolean().refine(v => v, { message: 'Obrigatório' }),
  })
  .refine(data => data.senha === data.confirmarSenha, {
    message: 'As senhas não conferem',
    path: ['confirmarSenha'],
  })

type FormValues = z.infer<typeof formSchema>

export default function CadastroAtleta18Page() {
  const router = useRouter()
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema) })

  function onSubmit(data: FormValues) {
    console.log(data)
    router.push('/')
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="container mx-auto flex-grow py-8 md:py-10">
        <h1 className="mb-8 text-3xl font-bold">Cadastro Atleta 18+</h1>
        <div className="mb-8 flex justify-center">
          <SocialAuth />
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-none bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
            <CardHeader>
              <CardTitle>Dados do atleta</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-5">
              <div className="grid gap-2 lg:col-span-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input id="nome" {...form.register('nome')} />
                {form.formState.errors.nome && (
                  <p className="text-sm text-destructive">{form.formState.errors.nome.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" {...form.register('cpf')} />
                {form.formState.errors.cpf && (
                  <p className="text-sm text-destructive">{form.formState.errors.cpf.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pais">País</Label>
                <Input id="pais" {...form.register('pais')} />
                {form.formState.errors.pais && (
                  <p className="text-sm text-destructive">{form.formState.errors.pais.message}</p>
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
                <Label htmlFor="altura">Altura (opcional)</Label>
                <Input id="altura" {...form.register('altura')} />
                {form.formState.errors.altura && (
                  <p className="text-sm text-destructive">{form.formState.errors.altura.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="peso">Peso (opcional)</Label>
                <Input id="peso" {...form.register('peso')} />
                {form.formState.errors.peso && (
                  <p className="text-sm text-destructive">{form.formState.errors.peso.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="posicao">Posição</Label>
                <Input id="posicao" {...form.register('posicao')} />
                {form.formState.errors.posicao && (
                  <p className="text-sm text-destructive">{form.formState.errors.posicao.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="perna">Perna</Label>
                <Input id="perna" {...form.register('perna')} />
                {form.formState.errors.perna && (
                  <p className="text-sm text-destructive">{form.formState.errors.perna.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" {...form.register('cidade')} />
                {form.formState.errors.cidade && (
                  <p className="text-sm text-destructive">{form.formState.errors.cidade.message}</p>
                )}
              </div>
              <div className="grid gap-2 lg:col-span-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" {...form.register('email')} />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="senha">Senha</Label>
                <Input id="senha" type="password" {...form.register('senha')} />
                {form.formState.errors.senha && (
                  <p className="text-sm text-destructive">{form.formState.errors.senha.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmarSenha">Confirmar senha</Label>
                <Input id="confirmarSenha" type="password" {...form.register('confirmarSenha')} />
                {form.formState.errors.confirmarSenha && (
                  <p className="text-sm text-destructive">{form.formState.errors.confirmarSenha.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center gap-2">
            <input id="termos" type="checkbox" className="h-4 w-4" {...form.register('termos')} />
            <Label htmlFor="termos" className="text-sm">
              Li e aceito os Termos de Uso e a Política de Privacidade
            </Label>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Criar conta</Button>
          </div>
        </form>
        </main>
      </div>
    )
  }

