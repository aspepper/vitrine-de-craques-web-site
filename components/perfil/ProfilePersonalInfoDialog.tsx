"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TimesSelect } from "@/components/TimesSelect";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";

type BaseEditableProfile = {
  role: Role;
  displayName: string | null;
  bio: string | null;
  cpf: string | null;
  telefone: string | null;
  ddd: string | null;
  nascimento: string | null;
  genero: string | null;
  whatsapp: string | null;
  uf: string | null;
  cidade: string | null;
  pais: string | null;
  altura: string | null;
  peso: string | null;
  posicao: string | null;
  perna: string | null;
  site: string | null;
  endereco: string | null;
  redesSociais: string | null;
  areaAtuacao: string | null;
  portfolio: string | null;
  nomeFantasia: string | null;
  emailClube: string | null;
  cnpj: string | null;
  inscricaoEstadual: string | null;
  representanteNome: string | null;
  representanteCpf: string | null;
  representanteEmail: string | null;
  registroCbf: string | null;
  registroFifa: string | null;
  responsavelInstagram: string | null;
  atletaNome: string | null;
  atletaCpf: string | null;
  atletaNascimento: string | null;
  atletaGenero: string | null;
  atletaEsporte: string | null;
  atletaModalidade: string | null;
  atletaObservacoes: string | null;
  favoriteClubId: string | null;
  notifNovidades: boolean | null;
  notifJogos: boolean | null;
  notifEventos: boolean | null;
  notifAtletas: boolean | null;
  lgpdWhatsappNoticias: boolean | null;
  lgpdWhatsappConvites: boolean | null;
};

export type EditableProfile = BaseEditableProfile & { role: Role };

type SchemaMap = Record<Role, z.ZodTypeAny>;

type FormValues = Record<string, unknown> & {
  displayName: string;
  bio?: string | null;
};

const baseSchema = z.object({
  displayName: z
    .string({ required_error: "Informe um nome" })
    .trim()
    .min(1, "Informe um nome")
    .max(120, "Máximo de 120 caracteres"),
  bio: z
    .string()
    .max(600, "Máximo de 600 caracteres")
    .optional()
    .or(z.literal(""))
    .nullable(),
});

const schemaMap: SchemaMap = {
  TORCEDOR: baseSchema.extend({
    nascimento: z.string().optional(),
    cpf: z.string().optional(),
    genero: z.string().optional(),
    whatsapp: z.string().optional(),
    uf: z.string().optional(),
    cidade: z.string().optional(),
    favoriteClubId: z.string().optional().nullable(),
    notifNovidades: z.boolean().optional(),
    notifJogos: z.boolean().optional(),
    notifEventos: z.boolean().optional(),
    notifAtletas: z.boolean().optional(),
    lgpdWhatsappNoticias: z.boolean().optional(),
    lgpdWhatsappConvites: z.boolean().optional(),
  }),
  ATLETA: baseSchema.extend({
    cpf: z.string().optional(),
    pais: z.string().optional(),
    uf: z.string().optional(),
    cidade: z.string().optional(),
    posicao: z.string().optional(),
    perna: z.string().optional(),
    altura: z.string().optional(),
    peso: z.string().optional(),
    whatsapp: z.string().optional(),
  }),
  RESPONSAVEL: baseSchema.extend({
    cpf: z.string().optional(),
    nascimento: z.string().optional(),
    genero: z.string().optional(),
    whatsapp: z.string().optional(),
    responsavelInstagram: z.string().optional(),
    atletaNome: z.string().optional(),
    atletaCpf: z.string().optional(),
    atletaNascimento: z.string().optional(),
    atletaGenero: z.string().optional(),
    atletaEsporte: z.string().optional(),
    atletaModalidade: z.string().optional(),
    atletaObservacoes: z.string().optional(),
  }),
  IMPRENSA: baseSchema.extend({
    cpf: z.string().optional(),
    ddd: z.string().optional(),
    telefone: z.string().optional(),
    uf: z.string().optional(),
    cidade: z.string().optional(),
    site: z.string().optional(),
    endereco: z.string().optional(),
    redesSociais: z.string().optional(),
    areaAtuacao: z.string().optional(),
    portfolio: z.string().optional(),
  }),
  CLUBE: baseSchema.extend({
    nomeFantasia: z.string().optional(),
    telefone: z.string().optional(),
    emailClube: z.string().optional(),
    uf: z.string().optional(),
    cidade: z.string().optional(),
    cnpj: z.string().optional(),
    inscricaoEstadual: z.string().optional(),
    representanteNome: z.string().optional(),
    representanteCpf: z.string().optional(),
    representanteEmail: z.string().optional(),
    whatsapp: z.string().optional(),
  }),
  AGENTE: baseSchema.extend({
    cpf: z.string().optional(),
    telefone: z.string().optional(),
    registroCbf: z.string().optional(),
    registroFifa: z.string().optional(),
  }),
};

function getDefaultValues(profile: EditableProfile): FormValues {
  const base: FormValues = {
    displayName: profile.displayName ?? "",
    bio: profile.bio ?? "",
  };

  switch (profile.role) {
    case "TORCEDOR":
      return {
        ...base,
        nascimento: profile.nascimento ?? "",
        cpf: profile.cpf ?? "",
        genero: profile.genero ?? "",
        whatsapp: profile.whatsapp ?? "",
        uf: profile.uf ?? "",
        cidade: profile.cidade ?? "",
        favoriteClubId: profile.favoriteClubId ?? "",
        notifNovidades: profile.notifNovidades ?? false,
        notifJogos: profile.notifJogos ?? false,
        notifEventos: profile.notifEventos ?? false,
        notifAtletas: profile.notifAtletas ?? false,
        lgpdWhatsappNoticias: profile.lgpdWhatsappNoticias ?? false,
        lgpdWhatsappConvites: profile.lgpdWhatsappConvites ?? false,
      };
    case "ATLETA":
      return {
        ...base,
        cpf: profile.cpf ?? "",
        pais: profile.pais ?? "",
        uf: profile.uf ?? "",
        cidade: profile.cidade ?? "",
        posicao: profile.posicao ?? "",
        perna: profile.perna ?? "",
        altura: profile.altura ?? "",
        peso: profile.peso ?? "",
        whatsapp: profile.whatsapp ?? "",
      };
    case "RESPONSAVEL":
      return {
        ...base,
        cpf: profile.cpf ?? "",
        nascimento: profile.nascimento ?? "",
        genero: profile.genero ?? "",
        whatsapp: profile.whatsapp ?? "",
        responsavelInstagram: profile.responsavelInstagram ?? "",
        atletaNome: profile.atletaNome ?? "",
        atletaCpf: profile.atletaCpf ?? "",
        atletaNascimento: profile.atletaNascimento ?? "",
        atletaGenero: profile.atletaGenero ?? "",
        atletaEsporte: profile.atletaEsporte ?? "",
        atletaModalidade: profile.atletaModalidade ?? "",
        atletaObservacoes: profile.atletaObservacoes ?? "",
      };
    case "IMPRENSA":
      return {
        ...base,
        cpf: profile.cpf ?? "",
        ddd: profile.ddd ?? "",
        telefone: profile.telefone ?? "",
        uf: profile.uf ?? "",
        cidade: profile.cidade ?? "",
        site: profile.site ?? "",
        endereco: profile.endereco ?? "",
        redesSociais: profile.redesSociais ?? "",
        areaAtuacao: profile.areaAtuacao ?? "",
        portfolio: profile.portfolio ?? "",
      };
    case "CLUBE":
      return {
        ...base,
        nomeFantasia: profile.nomeFantasia ?? "",
        telefone: profile.telefone ?? "",
        emailClube: profile.emailClube ?? "",
        uf: profile.uf ?? "",
        cidade: profile.cidade ?? "",
        cnpj: profile.cnpj ?? "",
        inscricaoEstadual: profile.inscricaoEstadual ?? "",
        representanteNome: profile.representanteNome ?? "",
        representanteCpf: profile.representanteCpf ?? "",
        representanteEmail: profile.representanteEmail ?? "",
        whatsapp: profile.whatsapp ?? "",
      };
    case "AGENTE":
      return {
        ...base,
        cpf: profile.cpf ?? "",
        telefone: profile.telefone ?? "",
        registroCbf: profile.registroCbf ?? "",
        registroFifa: profile.registroFifa ?? "",
      };
    default:
      return base;
  }
}

function normalizeString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function renderError(message: unknown) {
  if (typeof message !== "string" || message.length === 0) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

type RoleSpecificFieldsProps = {
  role: Role;
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
};

function RoleSpecificFields({ role, register, control, errors }: RoleSpecificFieldsProps) {
  switch (role) {
    case "TORCEDOR":
      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nascimento">Data de nascimento</Label>
              <Input id="nascimento" type="date" {...register("nascimento")} />
              {renderError(errors.nascimento?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="genero">Gênero</Label>
              <Input id="genero" {...register("genero")} />
              {renderError(errors.genero?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" {...register("cpf")} />
              {renderError(errors.cpf?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" {...register("whatsapp")} />
              {renderError(errors.whatsapp?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="uf">UF</Label>
              <Input id="uf" maxLength={2} {...register("uf")} />
              {renderError(errors.uf?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" {...register("cidade")} />
              {renderError(errors.cidade?.message)}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="favoriteClubId">Clube do coração</Label>
            <Controller
              control={control}
              name="favoriteClubId"
              render={({ field }) => (
                <TimesSelect
                  id="favoriteClubId"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={(field.value as string | undefined) ?? ""}
                  onChange={(event) => field.onChange(event.target.value)}
                />
              )}
            />
            {renderError(errors.favoriteClubId?.message as string | undefined)}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { field: "notifNovidades", label: "Receber novidades" },
              { field: "notifJogos", label: "Alertas de jogos" },
              { field: "notifEventos", label: "Convites para eventos" },
              { field: "notifAtletas", label: "Atualizações de atletas" },
              { field: "lgpdWhatsappNoticias", label: "Aceito notícias via WhatsApp" },
              { field: "lgpdWhatsappConvites", label: "Aceito convites via WhatsApp" },
            ].map(({ field, label }) => (
              <label
                key={field}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm",
                  "dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200",
                )}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-emerald-500"
                  {...register(field as keyof FormValues)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
      );
    case "ATLETA":
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" {...register("cpf")} />
            {renderError(errors.cpf?.message)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pais">País</Label>
            <Input id="pais" {...register("pais")} />
            {renderError(errors.pais?.message)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="uf">UF</Label>
            <Input id="uf" maxLength={2} {...register("uf")} />
            {renderError(errors.uf?.message)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input id="cidade" {...register("cidade")} />
            {renderError(errors.cidade?.message)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="posicao">Posição</Label>
            <Input id="posicao" {...register("posicao")} />
            {renderError(errors.posicao?.message)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="perna">Perna dominante</Label>
            <Input id="perna" {...register("perna")} />
            {renderError(errors.perna?.message)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="altura">Altura</Label>
            <Input id="altura" {...register("altura")} />
            {renderError(errors.altura?.message)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="peso">Peso</Label>
            <Input id="peso" {...register("peso")} />
            {renderError(errors.peso?.message)}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" {...register("whatsapp")} />
            {renderError(errors.whatsapp?.message)}
          </div>
        </div>
      );
    case "RESPONSAVEL":
      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" {...register("cpf")} />
              {renderError(errors.cpf?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nascimento">Data de nascimento</Label>
              <Input id="nascimento" type="date" {...register("nascimento")} />
              {renderError(errors.nascimento?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="genero">Gênero</Label>
              <Input id="genero" {...register("genero")} />
              {renderError(errors.genero?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" {...register("whatsapp")} />
              {renderError(errors.whatsapp?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsavelInstagram">Instagram</Label>
              <Input
                id="responsavelInstagram"
                placeholder="@usuario"
                {...register("responsavelInstagram")}
              />
              {renderError(errors.responsavelInstagram?.message)}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="atletaNome">Nome do atleta</Label>
              <Input id="atletaNome" {...register("atletaNome")} />
              {renderError(errors.atletaNome?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="atletaCpf">CPF do atleta</Label>
              <Input id="atletaCpf" {...register("atletaCpf")} />
              {renderError(errors.atletaCpf?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="atletaNascimento">Nascimento do atleta</Label>
              <Input id="atletaNascimento" type="date" {...register("atletaNascimento")} />
              {renderError(errors.atletaNascimento?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="atletaGenero">Gênero do atleta</Label>
              <Input id="atletaGenero" {...register("atletaGenero")} />
              {renderError(errors.atletaGenero?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="atletaEsporte">Esporte</Label>
              <Input id="atletaEsporte" {...register("atletaEsporte")} />
              {renderError(errors.atletaEsporte?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="atletaModalidade">Modalidade</Label>
              <Input id="atletaModalidade" {...register("atletaModalidade")} />
              {renderError(errors.atletaModalidade?.message)}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="atletaObservacoes">Observações</Label>
            <Textarea id="atletaObservacoes" rows={3} {...register("atletaObservacoes")} />
            {renderError(errors.atletaObservacoes?.message)}
          </div>
        </div>
      );
    case "IMPRENSA":
      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" {...register("cpf")} />
              {renderError(errors.cpf?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ddd">DDD</Label>
              <Input id="ddd" maxLength={3} {...register("ddd")} />
              {renderError(errors.ddd?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" {...register("telefone")} />
              {renderError(errors.telefone?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="uf">UF</Label>
              <Input id="uf" maxLength={2} {...register("uf")} />
              {renderError(errors.uf?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" {...register("cidade")} />
              {renderError(errors.cidade?.message)}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input id="endereco" {...register("endereco")} />
              {renderError(errors.endereco?.message)}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="site">Site</Label>
              <Input id="site" {...register("site")} />
              {renderError(errors.site?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfólio</Label>
              <Input id="portfolio" {...register("portfolio")} />
              {renderError(errors.portfolio?.message)}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="redesSociais">Redes sociais</Label>
              <Textarea id="redesSociais" rows={3} {...register("redesSociais")} />
              {renderError(errors.redesSociais?.message)}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="areaAtuacao">Área de atuação</Label>
              <Textarea id="areaAtuacao" rows={3} {...register("areaAtuacao")} />
              {renderError(errors.areaAtuacao?.message)}
            </div>
          </div>
        </div>
      );
    case "CLUBE":
      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nomeFantasia">Nome fantasia</Label>
              <Input id="nomeFantasia" {...register("nomeFantasia")} />
              {renderError(errors.nomeFantasia?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" {...register("telefone")} />
              {renderError(errors.telefone?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailClube">E-mail do clube</Label>
              <Input id="emailClube" type="email" {...register("emailClube")} />
              {renderError(errors.emailClube?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" {...register("whatsapp")} />
              {renderError(errors.whatsapp?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="uf">UF</Label>
              <Input id="uf" maxLength={2} {...register("uf")} />
              {renderError(errors.uf?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" {...register("cidade")} />
              {renderError(errors.cidade?.message)}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" {...register("cnpj")} />
              {renderError(errors.cnpj?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="inscricaoEstadual">Inscrição estadual</Label>
              <Input id="inscricaoEstadual" {...register("inscricaoEstadual")} />
              {renderError(errors.inscricaoEstadual?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="representanteNome">Nome do representante</Label>
              <Input id="representanteNome" {...register("representanteNome")} />
              {renderError(errors.representanteNome?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="representanteCpf">CPF do representante</Label>
              <Input id="representanteCpf" {...register("representanteCpf")} />
              {renderError(errors.representanteCpf?.message)}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="representanteEmail">E-mail do representante</Label>
              <Input id="representanteEmail" type="email" {...register("representanteEmail")} />
              {renderError(errors.representanteEmail?.message)}
            </div>
          </div>
        </div>
      );
    case "AGENTE":
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" {...register("cpf")} />
            {renderError(errors.cpf?.message)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" {...register("telefone")} />
            {renderError(errors.telefone?.message)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="registroCbf">Registro CBF</Label>
            <Input id="registroCbf" {...register("registroCbf")} />
            {renderError(errors.registroCbf?.message)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="registroFifa">Registro FIFA</Label>
            <Input id="registroFifa" {...register("registroFifa")} />
            {renderError(errors.registroFifa?.message)}
          </div>
        </div>
      );
    default:
      return null;
  }
}

export function ProfilePersonalInfoDialog({ profile }: { profile: EditableProfile }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const schema = useMemo(() => schemaMap[profile.role], [profile.role]);
  const defaultValues = useMemo(() => getDefaultValues(profile), [profile]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const errors = form.formState.errors;

  async function onSubmit(values: Record<string, unknown>) {
    try {
      setSubmitting(true);
      setErrorMessage(null);

      const payload: Record<string, unknown> = { role: profile.role };

      for (const [key, value] of Object.entries(values)) {
        if (value === undefined) {
          payload[key] = null;
        } else if (typeof value === "string") {
          payload[key] = normalizeString(value);
        } else {
          payload[key] = value;
        }
      }

      const response = await fetch("/api/profile/personal-info", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        const message = data?.error ?? "Não foi possível salvar as alterações.";
        setErrorMessage(message);
        return;
      }

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      setErrorMessage("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          rounded="xl"
          className="h-12 w-12 border-0 bg-white/80 text-slate-500 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-600 focus-visible:ring-emerald-500 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
        >
          <PencilLine className="h-5 w-5" aria-hidden />
          <span className="sr-only">Editar informações pessoais</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar informações pessoais</DialogTitle>
          <DialogDescription>
            Atualize seus dados para manter o perfil sempre completo e em destaque.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="displayName">Nome de exibição</Label>
              <Input id="displayName" {...form.register("displayName")} />
              {renderError(errors.displayName?.message)}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={3} {...form.register("bio")} />
              {renderError(errors.bio?.message)}
            </div>
          </div>

          <RoleSpecificFields
            role={profile.role}
            register={form.register}
            control={form.control}
            errors={errors}
          />

          {errorMessage ? (
            <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{errorMessage}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" size="md" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
