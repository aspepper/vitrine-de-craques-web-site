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
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-muted-foreground">
        Entrar com rede social (opcional)
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {providers.map((provider) => (
          <Button
            key={provider.id}
            variant="outline"
            className="flex items-center gap-2 px-4"
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
    </div>
  )
}

export default SocialAuth

