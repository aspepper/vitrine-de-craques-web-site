'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const PROFILE_CONFIG: Record<string, { role: string; schema: any; fields: { name: string; label: string; type?: string }[] }> = {
  'torcedor': {
    role: 'TORCEDOR',
    schema: z.object({ club: z.string().min(1, { message: 'Clube obrigatório' }) }),
    fields: [{ name: 'club', label: 'Clube do coração' }]
  },
  'atleta-18': {
    role: 'ATLETA',
    schema: z.object({ documento: z.string().min(1, { message: 'Documento obrigatório' }) }),
    fields: [{ name: 'documento', label: 'Documento de identidade' }]
  },
  'responsavel': {
    role: 'RESPONSAVEL',
    schema: z.object({ documento: z.string().min(1, { message: 'Documento obrigatório' }) }),
    fields: [{ name: 'documento', label: 'Documento' }]
  },
  'imprensa-jornalistablogueiro': {
    role: 'IMPRENSA',
    schema: z.object({ veiculo: z.string().min(1, { message: 'Veículo obrigatório' }) }),
    fields: [{ name: 'veiculo', label: 'Veículo de imprensa' }]
  },
  'clube': {
    role: 'CLUBE',
    schema: z.object({ nome: z.string().min(1, { message: 'Nome do clube obrigatório' }) }),
    fields: [{ name: 'nome', label: 'Nome do clube' }]
  },
  'de-documentos-necessarios-para-pais-e-responsaveis': {
    role: 'RESPONSAVEL',
    schema: z.object({ documento: z.string().min(1, { message: 'Documento obrigatório' }) }),
    fields: [{ name: 'documento', label: 'Documento do responsável' }]
  }
}

interface PageProps {
  params: { slug: string }
}

export default function CadastroPerfilPage({ params }: PageProps) {
  const config = PROFILE_CONFIG[params.slug]
  const router = useRouter()
  const form = useForm<any>({ resolver: zodResolver(config?.schema ?? z.object({})) })

  if (!config) {
    return <p className='p-4'>Perfil inválido</p>
  }

  async function onSubmit(data: any) {
    await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: config.role, data })
    })
    router.push('/perfil')
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <Card className='mx-auto max-w-md w-full'>
        <CardHeader>
          <CardTitle>Cadastro - {params.slug}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4'>
            {config.fields.map(field => (
              <div key={field.name} className='grid gap-2'>
                <Label htmlFor={field.name}>{field.label}</Label>
                <Input id={field.name} type={field.type || 'text'} {...form.register(field.name)} />
                {form.formState.errors[field.name] && (
                  <p className='text-sm text-destructive'>
                    {form.formState.errors[field.name]?.message as string}
                  </p>
                )}
              </div>
            ))}
            <Button type='submit'>Salvar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

