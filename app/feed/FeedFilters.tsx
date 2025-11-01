"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar, Hash, MapPin, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { buildVideoQueryString, parseVideoFilters } from "@/lib/video-filters";
import type { FilterableRole, VideoFilters } from "@/lib/video-filters";

const CATEGORY_OPTIONS = [
  { label: "Todos", value: "" },
  { label: "Atletas", value: "ATLETA" },
  { label: "Agentes", value: "AGENTE" },
  { label: "Clubes", value: "CLUBE" },
  { label: "Arquibancada", value: "TORCEDOR" },
  { label: "Imprensa", value: "IMPRENSA" },
  { label: "Responsáveis", value: "RESPONSAVEL" },
] as const;

const STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

const QUICK_FILTERS = ["Categoria", "Estado", "Hashtags"] as const;

type CategoryValue = (typeof CATEGORY_OPTIONS)[number]["value"];
type RoleCategory = FilterableRole;
type StateValue = "" | (typeof STATES)[number];

type FilterFormState = {
  category: CategoryValue;
  state: StateValue;
  hashtag: string;
  minAge: string;
  maxAge: string;
  startDate: string;
  endDate: string;
};

function isRole(value: CategoryValue): value is RoleCategory {
  return value !== "";
}

function normalizeStateValue(state: string | undefined): StateValue {
  if (!state) {
    return "";
  }

  return STATES.includes(state as (typeof STATES)[number])
    ? (state as StateValue)
    : "";
}

function buildInitialState(filters: VideoFilters): FilterFormState {
  return {
    category: filters.category ?? "",
    state: normalizeStateValue(filters.state),
    hashtag: filters.hashtag?.replace(/^#+/, "") ?? "",
    minAge: filters.minAge != null ? String(filters.minAge) : "",
    maxAge: filters.maxAge != null ? String(filters.maxAge) : "",
    startDate: filters.startDate ?? "",
    endDate: filters.endDate ?? "",
  };
}

export function FeedFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentFilters = useMemo(() => parseVideoFilters(searchParams), [searchParams]);
  const [formState, setFormState] = useState<FilterFormState>(() =>
    buildInitialState(currentFilters),
  );

  useEffect(() => {
    setFormState(buildInitialState(currentFilters));
  }, [currentFilters]);

  const categoryRef = useRef<HTMLSelectElement>(null);
  const stateRef = useRef<HTMLSelectElement>(null);
  const hashtagRef = useRef<HTMLInputElement>(null);

  const handleQuickFilterClick = (item: (typeof QUICK_FILTERS)[number]) => {
    const focusMap = {
      Categoria: categoryRef,
      Estado: stateRef,
      Hashtags: hashtagRef,
    } as const;

    const ref = focusMap[item];
    ref.current?.focus();
  };

  const handleChange = (
    field: keyof FilterFormState,
    value: string,
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextFilters: VideoFilters = {
      category: isRole(formState.category)
        ? formState.category
        : undefined,
      state: formState.state || undefined,
      hashtag: formState.hashtag ? `#${formState.hashtag.replace(/^#+/, "")}` : undefined,
      minAge: formState.minAge ? Number.parseInt(formState.minAge, 10) : undefined,
      maxAge: formState.maxAge ? Number.parseInt(formState.maxAge, 10) : undefined,
      startDate: formState.startDate || undefined,
      endDate: formState.endDate || undefined,
    };

    const query = buildVideoQueryString(nextFilters);
    const url = query ? `${pathname}?${query}` : pathname;

    startTransition(() => {
      router.push(url);
    });
  };

  const handleReset = () => {
    const empty: VideoFilters = {};
    setFormState(buildInitialState(empty));
    startTransition(() => {
      router.push(pathname);
    });
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex flex-wrap gap-2">
        {QUICK_FILTERS.map((item, index) => (
          <button
            key={item}
            type="button"
            onClick={() => handleQuickFilterClick(item)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600 transition hover:-translate-y-0.5 hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:bg-transparent dark:text-emerald-200",
              index === 0 && "min-w-[156px] justify-center px-6 py-3 text-sm",
            )}
          >
            {item === "Categoria" && <PlayCircle className="h-4 w-4" aria-hidden />}
            {item === "Estado" && <MapPin className="h-4 w-4" aria-hidden />}
            {item === "Hashtags" && <Hash className="h-4 w-4" aria-hidden />}
            <span>{item}</span>
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        Categoria
        <div className="relative">
          <select
            ref={categoryRef}
            value={formState.category}
            onChange={(event) => handleChange("category", event.target.value)}
            className="flex h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-600 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 dark:border-white/15 dark:bg-white/5 dark:text-slate-100"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronIcon />
        </div>
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        Estado
        <div className="relative">
          <select
            ref={stateRef}
            value={formState.state}
            onChange={(event) => handleChange("state", normalizeStateValue(event.target.value))}
            className="flex h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-600 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 dark:border-white/15 dark:bg-white/5 dark:text-slate-100"
          >
            <option value="">Selecione</option>
            {STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <ChevronIcon />
        </div>
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        Hashtag
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.5)] dark:border-white/15 dark:bg-white/5 dark:text-slate-100">
          <Hash className="h-4 w-4 text-slate-400" aria-hidden />
          <Input
            ref={hashtagRef}
            type="text"
            value={formState.hashtag}
            onChange={(event) => handleChange("hashtag", event.target.value)}
            placeholder="Digite uma hashtag"
            className="h-auto w-full border-0 bg-transparent p-0 text-xs uppercase tracking-[0.14em] text-slate-500 placeholder:text-slate-400 focus-visible:ring-0"
          />
        </div>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          Idade mínima
          <Input
            type="number"
            min={0}
            value={formState.minAge}
            onChange={(event) => handleChange("minAge", event.target.value)}
            placeholder="Ex: 14"
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.5)] focus-visible:ring-emerald-500/30 dark:border-white/15 dark:bg-white/5 dark:text-slate-100"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          Idade máxima
          <Input
            type="number"
            min={0}
            value={formState.maxAge}
            onChange={(event) => handleChange("maxAge", event.target.value)}
            placeholder="Ex: 22"
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.5)] focus-visible:ring-emerald-500/30 dark:border-white/15 dark:bg-white/5 dark:text-slate-100"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          Data inicial
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input
              type="date"
              value={formState.startDate}
              onChange={(event) => handleChange("startDate", event.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white pl-11 pr-5 text-sm text-slate-600 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.5)] focus-visible:ring-emerald-500/30 dark:border-white/15 dark:bg-white/5 dark:text-slate-100"
              aria-label="Data inicial"
            />
          </div>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          Data final
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input
              type="date"
              value={formState.endDate}
              onChange={(event) => handleChange("endDate", event.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white pl-11 pr-5 text-sm text-slate-600 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.5)] focus-visible:ring-emerald-500/30 dark:border-white/15 dark:bg-white/5 dark:text-slate-100"
              aria-label="Data final"
            />
          </div>
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          className="h-12 w-full rounded-2xl bg-emerald-500 text-sm font-semibold text-white shadow-[0_18px_32px_-18px_rgba(34,197,94,0.8)] transition hover:-translate-y-0.5 hover:bg-emerald-500/90 disabled:cursor-not-allowed disabled:opacity-75"
          disabled={isPending}
        >
          {isPending ? "Aplicando..." : "Aplicar filtros"}
        </Button>
        <button
          type="button"
          onClick={handleReset}
          className="text-sm font-medium text-emerald-600 transition hover:text-emerald-500 focus:outline-none focus-visible:underline dark:text-emerald-200"
        >
          Limpar filtros
        </button>
      </div>
    </form>
  );
}

function ChevronIcon() {
  return (
    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
      <svg
        aria-hidden
        focusable="false"
        className="h-4 w-4 text-slate-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
      </svg>
    </span>
  );
}
