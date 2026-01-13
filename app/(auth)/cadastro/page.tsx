'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Lock, Mail, UserRound } from "lucide-react"

import SocialAuth from "@/components/SocialAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const registerSchema = z
  .object({
    login: z.string().min(3, { message: "O login deve ter pelo menos 3 caracteres." }),
    email: z.string().email({ message: "Email inválido." }),
    password: z.string().min(8, { message: "A senha deve ter pelo menos 8 caracteres." }),
    confirmPassword: z.string().min(8, { message: "Confirme a senha." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export default function CadastroPage() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })
  const [apiError, setApiError] = useState<string | null>(null)

  const onSubmit = async (data: RegisterFormValues) => {
    setApiError(null)
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.login,
          email: data.email,
          password: data.password,
        }),
      })

      if (res.ok) {
        router.push("/login")
        return
      }

      const payload = await res.json().catch(() => ({}))
      const errorMessage =
        typeof payload?.error === "string"
          ? payload.error
          : payload?.error?.fieldErrors
            ? "Confira os dados preenchidos e tente novamente."
            : "Não foi possível criar sua conta. Tente novamente."
      setApiError(errorMessage)
    } catch (error) {
      setApiError("Não foi possível criar sua conta. Verifique sua conexão e tente novamente.")
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="container mx-auto flex-grow py-8 md:py-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Crie sua conta em poucos passos
            </h1>
            <p className="text-sm text-muted-foreground">
              Cadastre-se rapidamente e depois escolha o perfil ideal quando quiser explorar tudo o que a plataforma oferece.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
            <Card className="w-full border-none bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
              <CardHeader>
                <CardTitle>Cadastro simples</CardTitle>
                <CardDescription>
                  Use seu login, e-mail e senha para criar sua conta base.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="login" className="text-sm font-semibold text-slate-700">
                      Login
                    </Label>
                    <div className="relative">
                      <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="login"
                        placeholder="seu.usuario"
                        className="pl-11"
                        {...register("login")}
                      />
                    </div>
                    {errors.login && <p className="text-sm text-destructive">{errors.login.message}</p>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                      E-mail
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="voce@email.com"
                        className="pl-11"
                        {...register("email")}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                        Senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="********"
                          className="pl-11"
                          {...register("password")}
                        />
                      </div>
                      {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
                        Confirmar senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="********"
                          className="pl-11"
                          {...register("confirmPassword")}
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>

                  {apiError && (
                    <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {apiError}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full text-sm font-semibold italic"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Criando conta..." : "Criar conta"}
                  </Button>
                </form>

                <div className="text-center text-sm text-slate-600">
                  Já tem uma conta?{" "}
                  <Link href="/login" className="font-semibold text-primary hover:underline">
                    Faça login
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <SocialAuth />

              <div className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.45)]">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Próximo passo opcional
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">
                  Quer se posicionar em um perfil específico?
                </h2>
                <p className="mt-3 text-sm text-slate-600">
                  Quando estiver pronto, escolha seu perfil e desbloqueie experiências personalizadas para atletas, clubes, imprensa e muito mais.
                </p>
                <Button asChild className="mt-6 w-full rounded-full">
                  <Link href="/registrar-escolha-perfil">Escolher perfil agora</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
