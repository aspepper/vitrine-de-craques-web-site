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
  nomeSocial: z.string().optional(),
  nome: z.string().min(1, { message: 'Nome completo obrigatório' }),
  cpf: z.string().min(1, { message: 'CPF obrigatório' }),
  ddd: z.string().min(1, { message: 'DDD obrigatório' }),
  telefone: z.string().min(1, { message: 'Telefone obrigatório' }),
  uf: z.string().min(1, { message: 'UF obrigatória' }),
  cidade: z.string().min(1, { message: 'Cidade obrigatória' }),
  email: z.string().email({ message: 'E-mail inválido' }),
  site: z.string().url({ message: 'URL inválida' }).optional(),
  endereco: z.string().min(1, { message: 'Endereço obrigatório' }),
  redesSociais: z.string().optional(),
  areaAtuacao: z.string().min(1, { message: 'Área de atuação obrigatória' }),
  portfolio: z.string().url({ message: 'URL inválida' }).optional(),
  termos: z.literal(true, {
    errorMap: () => ({ message: 'É necessário aceitar os termos' }),
  }),
})

type FormValues = z.infer<typeof formSchema>

export default function CadastroImprensaPage() {
  const router = useRouter()
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema) })

  function onSubmit(data: FormValues) {
    console.log(data)
    router.push('/')
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="container mx-auto flex-grow py-12">
        <h1 className="mb-8 text-left text-3xl font-bold">
          Cadastro Jornalista/Blogueiro
        </h1>
        <div className="mb-8 flex justify-center">
          <SocialAuth />
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-none bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
            <CardHeader>
              <CardTitle>Dados e portfólio</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="nomeSocial">Nome social (opcional)</Label>
                <Input id="nomeSocial" {...form.register('nomeSocial')} />
                {form.formState.errors.nomeSocial && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.nomeSocial.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input id="nome" {...form.register('nome')} />
                {form.formState.errors.nome && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.nome.message}
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
                <Label htmlFor="ddd">DDD</Label>
                <Input id="ddd" {...form.register('ddd')} />
                {form.formState.errors.ddd && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.ddd.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telefone">Telefone/WhatsApp</Label>
                <Input id="telefone" {...form.register('telefone')} />
                {form.formState.errors.telefone && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.telefone.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="uf">UF</Label>
                <Input id="uf" {...form.register('uf')} />
                {form.formState.errors.uf && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.uf.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" {...form.register('cidade')} />
                {form.formState.errors.cidade && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.cidade.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" {...form.register('email')} />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="site">Site/Blog</Label>
                <Input id="site" {...form.register('site')} />
                {form.formState.errors.site && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.site.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="endereco">Endereço completo</Label>
                <Input id="endereco" {...form.register('endereco')} />
                {form.formState.errors.endereco && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.endereco.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="redesSociais">
                  Links de seus perfis nas redes sociais
                </Label>
                <Input
                  id="redesSociais"
                  {...form.register('redesSociais')}
                />
                {form.formState.errors.redesSociais && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.redesSociais.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="areaAtuacao">Área de atuação</Label>
                <Input id="areaAtuacao" {...form.register('areaAtuacao')} />
                {form.formState.errors.areaAtuacao && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.areaAtuacao.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="portfolio">Link do portfólio (opcional)</Label>
                <Input id="portfolio" {...form.register('portfolio')} />
                {form.formState.errors.portfolio && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.portfolio.message}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2 sm:col-span-2">
                <input
                  type="checkbox"
                  id="termos"
                  className="h-4 w-4"
                  {...form.register('termos')}
                />
                <Label htmlFor="termos" className="font-normal">
                  Li e aceito os <a href="#" className="underline">Termos de Uso</a> e a{' '}
                  <a href="#" className="underline">Política de Privacidade</a>
                </Label>
                {form.formState.errors.termos && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.termos.message}
                  </p>
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

