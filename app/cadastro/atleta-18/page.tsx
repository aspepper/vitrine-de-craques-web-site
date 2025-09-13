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
  posicao: z.string().min(1, { message: 'Posição obrigatória' }),
  senha: z.string().min(6, { message: 'Mínimo 6 caracteres' }),
  confirmarSenha: z.string().min(6),
}).refine((data) => data.senha === data.confirmarSenha, {
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
        <main className="container mx-auto flex-grow py-12">
        <div className="mb-8 flex justify-center">
          <SocialAuth />
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do atleta</CardTitle>
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
                <Label htmlFor="cpf">CPF</Label>
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
                <Label htmlFor="posicao">Posição</Label>
                <Input id="posicao" {...form.register('posicao')} />
                {form.formState.errors.posicao && (
                  <p className="text-sm text-destructive">{form.formState.errors.posicao.message}</p>
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
          <div className="flex justify-end">
            <Button type="submit">Criar conta</Button>
          </div>
        </form>
        </main>
      </div>
    )
  }

