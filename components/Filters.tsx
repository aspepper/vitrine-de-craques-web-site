"use client";

import type { FormHTMLAttributes } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FiltersProps extends FormHTMLAttributes<HTMLFormElement> {
  placeholder?: string;
  queryParam?: string;
  defaultValue?: string;
  buttonLabel?: string;
}

export function Filters({
  placeholder = "Filtros: Nome, Idade, Cidade, Estado",
  queryParam = "q",
  defaultValue = "",
  buttonLabel = "Filtrar",
  className,
  ...props
}: FiltersProps) {
  return (
    <form
      {...props}
      className={cn(
        "flex flex-col gap-4 lg:flex-row lg:items-center",
        className
      )}
    >
      <div className="relative flex-1">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
        />
        <input
          aria-label="Filtrar resultados"
          className="h-16 w-full rounded-full border border-slate-200/80 bg-white px-16 text-base text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition focus:border-slate-300 focus-visible:ring-2 focus-visible:ring-[#22C55E]/30"
          defaultValue={defaultValue}
          name={queryParam}
          placeholder={placeholder}
          type="search"
        />
      </div>

      <Button
        className="h-16 w-full rounded-full bg-[#22C55E] px-10 text-base font-semibold tracking-wide text-white shadow-[0_18px_32px_-18px_rgba(34,197,94,0.8)] transition hover:-translate-y-0.5 hover:bg-[#1EB153] focus-visible:ring-[#22C55E]/60 lg:w-auto"
        type="submit"
      >
        {buttonLabel}
      </Button>
    </form>
  );
}
