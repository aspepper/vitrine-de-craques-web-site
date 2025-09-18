'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Mail, Lock } from "lucide-react"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import SocialAuth from "@/components/SocialAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido." }),
  password: z.string().min(1, { message: "A senha é obrigatória." }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMessage(null)
    const res = await signIn('credentials', {
      ...data,
      redirect: false,
    })
    if (res?.error) {
      setErrorMessage('Credenciais inválidas')
    } else {
      router.push('/')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="container mx-auto flex-grow py-12">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Acessar sua conta</h1>
            <p className="text-sm text-muted-foreground">
              Utilize uma rede social ou preencha seus dados de acesso para entrar.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="w-full">
              <SocialAuth />
            </div>

            <Card className="w-full border-none bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
              <CardContent className="flex flex-col gap-6 px-6 py-8 sm:px-10">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-base font-semibold text-slate-900">
                    Ou entre com e-mail e senha
                  </p>
                  <Link
                    href="/registrar-escolha-perfil"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Não tem conta? Registrar
                  </Link>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                      E-mail
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="voce@email.com"
                        className="pl-12"
                        {...register("email")}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="********"
                        className="pl-12"
                        {...register("password")}
                      />
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                    <div className="flex justify-end">
                      <Link href="/recuperar-senha" className="text-xs font-semibold text-primary hover:underline">
                        Esqueci minha senha
                      </Link>
                    </div>
                  </div>

                  {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

                  <Button
                    type="submit"
                    className="h-14 w-full justify-center rounded-full text-base font-semibold shadow-[0_25px_70px_-35px_rgba(59,130,246,0.85)]"
                  >
                    Entrar
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

