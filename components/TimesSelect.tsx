"use client"

import { useEffect, useMemo, useState } from "react"
import * as React from "react"

import { cn } from "@/lib/utils"

interface TimesOption {
  id: string
  clube: string
  sigla: string
  estado: string
  cidade: string
  divisao: string
}

interface TimesSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  placeholder?: string
}

const baseClasses =
  "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)] transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-70"

export const TimesSelect = React.forwardRef<HTMLSelectElement, TimesSelectProps>(
  ({ className, placeholder = "Selecione um time", disabled, ...props }, ref) => {
    const [options, setOptions] = useState<TimesOption[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
      let isMounted = true

      async function loadTimes() {
        try {
          setLoading(true)
          setError(null)
          const response = await fetch("/api/times")
          if (!response.ok) {
            throw new Error("Falha ao carregar times")
          }

          const payload = (await response.json()) as {
            items?: TimesOption[]
          }

          if (!payload?.items || !Array.isArray(payload.items)) {
            throw new Error("Resposta inválida ao carregar times")
          }

          if (isMounted) {
            setOptions(payload.items)
          }
        } catch (err) {
          console.error(err)
          if (isMounted) {
            setError(
              err instanceof Error
                ? err.message
                : "Não foi possível carregar a lista de times.",
            )
          }
        } finally {
          if (isMounted) {
            setLoading(false)
          }
        }
      }

      void loadTimes()

      return () => {
        isMounted = false
      }
    }, [])

    const computedPlaceholder = useMemo(() => {
      if (loading) return "Carregando times..."
      if (error) return "Não foi possível carregar os times"
      return placeholder
    }, [error, loading, placeholder])

    const isDisabled = disabled || (loading && options.length === 0)

    return (
      <>
        <select
          ref={ref}
          className={cn(baseClasses, className)}
          disabled={isDisabled}
          {...props}
        >
          <option value="" disabled>
            {computedPlaceholder}
          </option>
          {options.map((option) => {
            const label = `${option.clube} (${option.sigla}) • ${option.estado}`
            return (
              <option key={option.id} value={option.id}>
                {label}
              </option>
            )
          })}
        </select>
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}
      </>
    )
  },
)

TimesSelect.displayName = "TimesSelect"
