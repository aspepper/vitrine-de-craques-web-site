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
      <main className="container mx-auto flex flex-grow flex-col justify-center py-16">
        <div className="mx-auto w-full max-w-5xl space-y-8">
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            Acessar sua conta
          </h1>

          <div className="rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
            <div className="flex flex-col gap-8 px-6 py-8 sm:px-10 lg:px-16">
              <SocialAuth />

              <div className="h-px w-full bg-slate-100" />

              <div className="flex flex-col gap-6">
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
                    <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                      <Mail className="h-5 w-5 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="voce@email.com"
                        className="h-auto border-0 bg-transparent p-0 text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                        {...register("email")}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                      Senha
                    </Label>
                    <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                      <Lock className="h-5 w-5 text-slate-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="********"
                        className="h-auto border-0 bg-transparent p-0 text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
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
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

