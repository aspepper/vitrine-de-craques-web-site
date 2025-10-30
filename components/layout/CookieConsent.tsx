"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles, Settings2, ListChecks } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "vdc:cookie-preferences";
const COOKIE_NAME = "vdc_cookie_preferences";

type CookiePreferenceKey = "essential" | "functional" | "analytics" | "marketing";

type CookiePreferences = {
  essential: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
};

const defaultPreferences: CookiePreferences = {
  essential: true,
  functional: false,
  analytics: false,
  marketing: false,
};

const preferenceOptions: PreferenceOption[] = [
  {
    key: "essential",
    title: "Cookies essenciais",
    description:
      "Garantem funcionalidades básicas como login seguro, navegação e salvamento de preferências obrigatórias.",
    locked: true,
  },
  {
    key: "functional",
    title: "Funcionais",
    description:
      "Personalizam a experiência, memorizam suas escolhas e tornam a navegação mais fluida entre dispositivos.",
  },
  {
    key: "analytics",
    title: "Métricas & desempenho",
    description:
      "Ajudam a medir audiência, erros e performance, para que possamos melhorar continuamente a plataforma.",
  },
  {
    key: "marketing",
    title: "Conteúdo e marketing",
    description:
      "Permitem recomendações personalizadas de atletas, clubes e conteúdos promocionais relevantes para você.",
  },
];

const presets: CookiePreset[] = [
  {
    key: "essential",
    title: "Somente o necessário",
    description: "Mantém apenas o mínimo obrigatório para a plataforma funcionar com segurança.",
    value: {
      ...defaultPreferences,
    },
  },
  {
    key: "balanced",
    title: "Experiência equilibrada",
    description: "Habilita métricas e funcionalidades para uma experiência personalizada, sem marketing.",
    value: {
      ...defaultPreferences,
      functional: true,
      analytics: true,
    },
  },
  {
    key: "complete",
    title: "Tudo liberado",
    description: "Aceita todos os cookies para receber recomendações completas e ofertas exclusivas.",
    value: {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    },
  },
];

interface PreferenceOption {
  key: CookiePreferenceKey;
  title: string;
  description: string;
  locked?: boolean;
}

interface CookiePreset {
  key: "essential" | "balanced" | "complete";
  title: string;
  description: string;
  value: CookiePreferences;
}

interface StoredPreferences extends CookiePreferences {
  updatedAt: string;
  preset?: CookiePreset["key"];
}

const parseStoredPreferences = (raw: string | null): StoredPreferences | null => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredPreferences>;

    if (typeof parsed !== "object" || parsed === null) return null;

    const preferences: StoredPreferences = {
      ...defaultPreferences,
      essential: true,
      functional: Boolean(parsed.functional),
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
      preset: parsed.preset,
    };

    return preferences;
  } catch (error) {
    console.error("Não foi possível interpretar preferências de cookies: ", error);
    return null;
  }
};

const readCookieValue = (name: string) => {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [cookieName, ...rest] = cookie.split("=");
    if (cookieName === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
};

const loadStoredPreferences = (): StoredPreferences | null => {
  if (typeof window === "undefined") return null;

  const fromStorage = window.localStorage.getItem(STORAGE_KEY);
  const fromCookie = readCookieValue(COOKIE_NAME);

  return parseStoredPreferences(fromStorage || fromCookie);
};

const persistPreferences = (preferences: StoredPreferences) => {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify(preferences);
  window.localStorage.setItem(STORAGE_KEY, payload);
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(payload)}; path=/; max-age=31536000; SameSite=Lax`;

  window.dispatchEvent(
    new CustomEvent("vdc:cookies:updated", {
      detail: preferences,
    })
  );
};

const useCookiePreferences = () => {
  const [preferences, setPreferences] = useState<StoredPreferences>({
    ...defaultPreferences,
    updatedAt: new Date(0).toISOString(),
  });
  const [hasStoredPreferences, setHasStoredPreferences] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  useEffect(() => {
    const stored = loadStoredPreferences();
    if (stored) {
      setPreferences(stored);
      setHasStoredPreferences(true);
      setIsBannerVisible(false);
    } else {
      setIsBannerVisible(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        const parsed = parseStoredPreferences(event.newValue);
        if (parsed) {
          setPreferences(parsed);
          setHasStoredPreferences(true);
        }
      }
    };

    const handleCustomEvent = (event: Event) => {
      const detail = (event as CustomEvent<StoredPreferences>).detail;
      if (detail) {
        setPreferences(detail);
        setHasStoredPreferences(true);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("vdc:cookies:updated", handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("vdc:cookies:updated", handleCustomEvent as EventListener);
    };
  }, []);

  const updatePreferences = useCallback(
    (next: StoredPreferences, { hideBanner = true }: { hideBanner?: boolean } = {}) => {
      setPreferences(next);
      setHasStoredPreferences(true);
      if (hideBanner) {
        setIsBannerVisible(false);
      }
      persistPreferences(next);
    },
    []
  );

  const acceptAll = useCallback(() => {
    const allEnabled: StoredPreferences = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
      preset: "complete",
      updatedAt: new Date().toISOString(),
    };
    updatePreferences(allEnabled);
  }, [updatePreferences]);

  const acceptOnlyEssential = useCallback(() => {
    const minimal: StoredPreferences = {
      ...defaultPreferences,
      preset: "essential",
      updatedAt: new Date().toISOString(),
    };
    updatePreferences(minimal);
  }, [updatePreferences]);

  return {
    preferences,
    hasStoredPreferences,
    isBannerVisible,
    updatePreferences,
    acceptAll,
    acceptOnlyEssential,
  };
};

export function CookieConsent() {
  const {
    preferences,
    hasStoredPreferences,
    isBannerVisible,
    updatePreferences,
    acceptAll,
    acceptOnlyEssential,
  } = useCookiePreferences();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [draftPreferences, setDraftPreferences] = useState<StoredPreferences>(preferences);

  useEffect(() => {
    setDraftPreferences(preferences);
  }, [preferences]);

  const activePreset = useMemo(() => {
    return (
      presets.find((preset) =>
        ["functional", "analytics", "marketing"].every((key) =>
          Boolean(
            draftPreferences[key as keyof CookiePreferences]
          ) === Boolean(preset.value[key as keyof CookiePreferences])
        )
      )?.key ?? null
    );
  }, [draftPreferences]);

  const handleSelectPreset = (preset: CookiePreset) => {
    setDraftPreferences({
      ...preset.value,
      updatedAt: new Date().toISOString(),
      preset: preset.key,
    });
  };

  const handleTogglePreference = (key: CookiePreferenceKey) => {
    if (key === "essential") return;
    setDraftPreferences((current) => ({
      ...current,
      [key]: !current[key],
      updatedAt: new Date().toISOString(),
      preset: undefined,
    }));
  };

  const handleSavePreferences = () => {
    updatePreferences(
      {
        ...draftPreferences,
        essential: true,
        updatedAt: new Date().toISOString(),
      },
      { hideBanner: true }
    );
    setIsSettingsOpen(false);
  };

  const handleOpenSettings = () => {
    setDraftPreferences(preferences);
    setIsSettingsOpen(true);
  };

  const showFloatingButton = hasStoredPreferences && !isBannerVisible;

  return (
    <>
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl border border-border/70 bg-background/95 text-foreground shadow-2xl backdrop-blur-sm dark:border-white/15 dark:bg-slate-950/95">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <Settings2 className="h-6 w-6 text-primary" aria-hidden />
              <DialogTitle className="text-xl">Preferências de privacidade e cookies</DialogTitle>
            </div>
            <DialogDescription className="text-left text-base">
              Ajuste o nível de coleta de dados para continuar navegando com transparência e sob medida para você.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Selecione um nível</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {presets.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={cn(
                      "group relative flex h-full flex-col rounded-3xl border bg-gradient-to-br p-4 text-left shadow-sm transition", 
                      activePreset === preset.key
                        ? "border-primary/80 from-primary/10 via-background to-background"
                        : "border-border/60 from-background via-background to-background hover:border-primary/50 hover:from-primary/5",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50"
                    )}
                  >
                    <span className="text-sm font-semibold text-foreground/90">{preset.title}</span>
                    <span className="mt-2 text-sm text-muted-foreground leading-relaxed">{preset.description}</span>
                    {activePreset === preset.key && (
                      <Sparkles className="absolute right-4 top-4 h-4 w-4 text-primary" aria-hidden />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Detalhe cada categoria</p>
              <div className="space-y-3">
                {preferenceOptions.map((option) => {
                  const isActive = Boolean(draftPreferences[option.key]);
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => handleTogglePreference(option.key)}
                      disabled={option.locked}
                      className={cn(
                        "flex w-full items-start gap-4 rounded-3xl border p-4 text-left shadow-sm transition", 
                        option.locked
                          ? "cursor-not-allowed border-primary/50 bg-primary/10"
                          : isActive
                          ? "border-primary/80 bg-primary/10"
                          : "border-border/60 bg-background hover:border-primary/50",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-1 flex h-5 w-5 items-center justify-center rounded-full border text-xs", 
                          isActive ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
                          option.locked && "border-primary bg-primary text-primary-foreground"
                        )}
                        aria-hidden
                      >
                        {isActive || option.locked ? "✓" : ""}
                      </span>
                      <span className="space-y-1">
                        <span className="block text-base font-semibold text-foreground/90">{option.title}</span>
                        <span className="block text-sm leading-relaxed text-muted-foreground">{option.description}</span>
                        {option.locked && (
                          <span className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                            sempre ativo
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsTermsOpen(true)}
              className="rounded-full border border-border/60 bg-background/80 text-sm text-muted-foreground hover:text-foreground"
            >
              Ver termos LGPD completos
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="rounded-full"
                onClick={acceptOnlyEssential}
              >
                Manter essenciais
              </Button>
              <Button type="button" className="rounded-full" onClick={handleSavePreferences}>
                Salvar preferências
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
        <DialogContent className="max-w-3xl border border-border/70 bg-background/95 text-foreground shadow-2xl backdrop-blur-sm dark:border-white/15 dark:bg-slate-950/95">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" aria-hidden />
              <DialogTitle className="text-xl">Termos LGPD e consentimento informado</DialogTitle>
            </div>
            <DialogDescription className="text-left text-base text-foreground/80">
              Construímos o Vitrine de Craques com segurança jurídica e transparência. Conheça como protegemos seus dados e
              como você pode exercer seus direitos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 overflow-y-auto pr-1 text-sm leading-relaxed text-foreground/80 md:max-h-[60vh] dark:text-foreground/70">
            <section className="space-y-2">
              <h3 className="text-base font-semibold text-foreground">Base legal e compromissos</h3>
              <p>
                Tratamos os seus dados pessoais com fundamento nas bases legais previstas pela Lei Geral de Proteção de Dados
                (Lei 13.709/2018), priorizando a execução do contrato com você, o legítimo interesse na manutenção da plataforma
                e, sempre que necessário, o seu consentimento explícito.
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Coletamos apenas informações necessárias para disponibilizar conteúdo esportivo e funcionalidades sociais.</li>
                <li>Você pode solicitar revisão, portabilidade ou exclusão dos dados por meio do canal de privacidade na área logada.</li>
                <li>Aplicamos controles técnicos, criptografia em repouso e acessos auditados para preservar a confidencialidade.</li>
              </ul>
            </section>
            <section className="space-y-2">
              <h3 className="text-base font-semibold text-foreground">Cookies, SDKs e armazenamento local</h3>
              <p>
                Utilizamos cookies e tecnologias similares para garantir segurança, lembrar preferências e entender o uso da
                plataforma. Nunca compartilhamos dados sensíveis com terceiros não autorizados.
              </p>
              <ol className="list-decimal space-y-2 pl-6">
                <li>Cookies essenciais guardam sessões autenticadas e proteções antifraude e permanecem sempre ativos.</li>
                <li>Funcionais aprimoram a experiência guardando preferências voluntárias e integrações multimídia.</li>
                <li>Métricas revelam dados agregados de desempenho e estabilidade para priorizar evoluções do produto.</li>
                <li>Marketing ativa recomendações de parceiros, convites para peneiras e novidades patrocinadas relevantes.</li>
              </ol>
            </section>
            <section className="space-y-2">
              <h3 className="text-base font-semibold text-foreground">Seus direitos como titular</h3>
              <p>
                Você controla completamente a coleta opcional. Pode alterar o consentimento a qualquer momento nesta mesma área,
                solicitar detalhes sobre o tratamento ou registrar reclamação diretamente com a Autoridade Nacional de Proteção de
                Dados.
              </p>
              <p>
                Para conhecer a política completa, acesse a seção dedicada em nossa plataforma ou contate nosso Encarregado de
                Dados pelo e-mail <a href="mailto:privacidade@vitrinedecraques.com" className="text-primary underline">privacidade@vitrinedecraques.com</a>.
              </p>
            </section>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button asChild variant="link" size="sm" className="px-0">
              <Link href="/privacidade">Ler política de privacidade completa</Link>
            </Button>
            <Button type="button" onClick={() => setIsTermsOpen(false)} className="rounded-full">
              Entendi e quero voltar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isBannerVisible && (
        <div
          className={cn(
            "pointer-events-auto fixed inset-x-4 bottom-4 z-[60] flex justify-center md:inset-x-0 md:bottom-6", 
            isSettingsOpen && "pointer-events-none opacity-0"
          )}
        >
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-border/50 bg-background/95 shadow-2xl backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/20" aria-hidden />
            <div className="relative flex flex-col gap-4 p-6 md:flex-row md:items-center md:gap-6">
              <div className="flex flex-1 flex-col gap-2 text-foreground">
                <div className="flex items-center gap-3 text-base font-semibold">
                  <ListChecks className="h-5 w-5 text-primary" aria-hidden />
                  <span>Respeitamos a sua privacidade</span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Utilizamos cookies para garantir segurança, personalizar conteúdos e entender o uso do Vitrine de Craques. Você
                  decide como deseja navegar e pode alterar as preferências quando quiser.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setIsTermsOpen(true)}
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Termos LGPD e política de cookies
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:min-w-[220px]">
                <Button type="button" className="rounded-full" onClick={acceptAll}>
                  Aceitar todos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={acceptOnlyEssential}
                >
                  Somente essenciais
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="rounded-full text-sm font-semibold shadow-sm hover:bg-muted"
                  onClick={handleOpenSettings}
                >
                  Personalizar níveis
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFloatingButton && (
        <div className="fixed bottom-4 right-4 z-[50]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full border border-border/60 bg-background/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground shadow-lg backdrop-blur"
            onClick={handleOpenSettings}
          >
            Preferências de cookies
          </Button>
        </div>
      )}
    </>
  );
}
