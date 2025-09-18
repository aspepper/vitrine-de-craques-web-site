"use client"

import Image from "next/image"
import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"

const providers = [
  { id: "google", name: "Google", icon: "/icons/icon-google-auth.png" },
  { id: "facebook", name: "Facebook", icon: "/icons/icon-facebook-auth.png" },
  { id: "microsoft", name: "Microsoft", icon: "/icons/icon-microsoft-auth.png" },
  { id: "apple", name: "Apple", icon: "/icons/icon-apple-auth.png" },
]

export function SocialAuth() {
  return (
    <div className="flex w-full flex-col gap-4">
      <p className="text-sm font-medium text-slate-600">
        Entre com rede social (opcional) ou preencha o formulário
      </p>
      <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {providers.map((provider) => (
          <Button
            key={provider.id}
            variant="outline"
            className="h-auto justify-start gap-3 rounded-full border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.55)] transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus-visible:ring-primary/30"
            onClick={() => signIn(provider.id)}
            type="button"
          >
            <Image
              src={provider.icon}
              alt={provider.name}
              width={24}
              height={24}
            />
            <span className="whitespace-nowrap">
              Continuar com {provider.name}
            </span>
          </Button>
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Após autenticar, voltaremos para a Home e enviaremos um e-mail para
        completar o cadastro.
      </p>
    </div>
  )
}

export default SocialAuth

