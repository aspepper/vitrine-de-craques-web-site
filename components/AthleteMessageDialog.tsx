"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AthleteMessageDialogProps {
  recipientId: string;
  recipientName?: string | null;
  canMessage: boolean;
  loginRedirectTo: string;
}

export function AthleteMessageDialog({
  recipientId,
  recipientName,
  canMessage,
  loginRedirectTo,
}: AthleteMessageDialogProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) {
      setMessage("");
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!canMessage && nextOpen) {
      router.push(loginRedirectTo);
      return;
    }

    setOpen(nextOpen);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canMessage) {
      router.push(loginRedirectTo);
      return;
    }

    const trimmed = message.trim();
    if (!trimmed) {
      setErrorMessage("Escreva uma mensagem antes de enviar.");
      return;
    }

    if (trimmed.length > 1000) {
      setErrorMessage("A mensagem deve ter no máximo 1000 caracteres.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipientId, content: trimmed }),
      });

      if (response.status === 401) {
        router.push(loginRedirectTo);
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const fallback =
          data && typeof data.message === "string"
            ? data.message
            : "Não foi possível enviar a mensagem.";
        setErrorMessage(fallback);
        return;
      }

      setSuccessMessage("Mensagem enviada com sucesso!");
      setMessage("");
      setTimeout(() => setOpen(false), 1200);
    } catch (error) {
      console.error(error);
      setErrorMessage("Não foi possível enviar a mensagem no momento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-full border-slate-300 bg-white px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 sm:w-auto"
        >
          Enviar mensagem
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="space-y-2">
            <DialogTitle>Enviar mensagem</DialogTitle>
            <DialogDescription>
              {recipientName
                ? `Converse diretamente com ${recipientName}.`
                : "Envie uma mensagem privada para este atleta."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Escreva sua mensagem..."
              maxLength={1000}
              disabled={isSubmitting}
              aria-describedby="message-help"
            />
            <p id="message-help" className="text-xs text-slate-500">
              Máximo de 1000 caracteres.
            </p>
            {errorMessage ? (
              <p className="text-sm text-destructive">{errorMessage}</p>
            ) : null}
            {successMessage ? (
              <p className="text-sm text-emerald-600">{successMessage}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

