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
  nomeClube: z.string().min(1, { message: 'Nome obrigatório' }),
  cnpj: z.string().min(1, { message: 'CNPJ obrigatório' }),
  telefone: z.string().min(1, { message: 'Telefone obrigatório' }),
  emailClube: z.string().email({ message: 'Email inválido' }),
  estado: z.string().min(1, { message: 'Estado obrigatório' }),
  cidade: z.string().min(1, { message: 'Cidade obrigatória' }),
  representanteNome: z.string().min(1, { message: 'Nome obrigatório' }),
  representanteCpf: z.string().min(1, { message: 'CPF obrigatório' }),
  representanteEmail: z.string().email({ message: 'Email inválido' }),
  representanteTelefone: z.string().min(1, { message: 'Telefone obrigatório' }),
})

type FormValues = z.infer<typeof formSchema>

export default function CadastroClubePage() {
  const router = useRouter()
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema) })

  function onSubmit(data: FormValues) {
    console.log(data)
    router.push('/')
  }

    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <main className="container mx-auto flex-grow py-12">
        <h1 className="mb-8 text-center text-3xl font-bold">Cadastro Clube/Entidade Desportiva</h1>
        <div className="mb-8 flex justify-center">
          <SocialAuth />
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
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
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" {...form.register('cnpj')} />
                {form.formState.errors.cnpj && (
                  <p className="text-sm text-destructive">{form.formState.errors.cnpj.message}</p>
                )}
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
                <Label htmlFor="estado">Estado</Label>
                <Input id="estado" {...form.register('estado')} />
                {form.formState.errors.estado && (
                  <p className="text-sm text-destructive">{form.formState.errors.estado.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" {...form.register('cidade')} />
                {form.formState.errors.cidade && (
                  <p className="text-sm text-destructive">{form.formState.errors.cidade.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
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
                <Label htmlFor="representanteTelefone">Telefone</Label>
                <Input id="representanteTelefone" {...form.register('representanteTelefone')} />
                {form.formState.errors.representanteTelefone && (
                  <p className="text-sm text-destructive">{form.formState.errors.representanteTelefone.message}</p>
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

