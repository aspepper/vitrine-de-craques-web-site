"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const CLIP_DURATION_SECONDS = 10;
const TARGET_RESOLUTION = "720x1280";

function formatSeconds(value: number): string {
  const safeValue = Number.isFinite(value) ? Math.max(value, 0) : 0;
  const minutes = Math.floor(safeValue / 60);
  const seconds = Math.floor(safeValue % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function UploadForm() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [clipStart, setClipStart] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [orientationWarning, setOrientationWarning] = useState(false);

  const clipEnd = useMemo(
    () => Math.min(clipStart + CLIP_DURATION_SECONDS, videoDuration || CLIP_DURATION_SECONDS),
    [clipStart, videoDuration],
  );
  const maxClipStart = useMemo(
    () => Math.max(videoDuration - CLIP_DURATION_SECONDS, 0),
    [videoDuration],
  );

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

  const resetVideoState = useCallback(() => {
    setVideoFile(null);
    setVideoDuration(0);
    setClipStart(0);
    setOrientationWarning(false);
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideoPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [videoPreviewUrl]);

  const handleVideoChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError(null);
    setSuccess(null);

    const nextUrl = URL.createObjectURL(file);
    const videoElement = document.createElement("video");
    videoElement.preload = "metadata";
    videoElement.src = nextUrl;

    videoElement.onloadedmetadata = () => {
      const duration = Number(videoElement.duration) || 0;
      setVideoDuration(duration);
      setClipStart(0);
      setVideoFile(file);
      setOrientationWarning(videoElement.videoWidth < videoElement.videoHeight ? false : true);

      setVideoPreviewUrl((previousUrl) => {
        if (previousUrl) {
          URL.revokeObjectURL(previousUrl);
        }
        return nextUrl;
      });
    };

    videoElement.onerror = () => {
      URL.revokeObjectURL(nextUrl);
      setError("Não foi possível carregar o vídeo selecionado. Tente novamente.");
      resetVideoState();
    };
  }, [resetVideoState]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!videoFile) {
        setError("Selecione um vídeo para continuar.");
        return;
      }

      setError(null);
      setSuccess(null);
      setIsSubmitting(true);

      try {
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("description", description.trim());
        formData.append("video", videoFile);
        formData.append("clipStart", clipStart.toFixed(2));
        formData.append("clipDuration", Math.min(CLIP_DURATION_SECONDS, videoDuration || CLIP_DURATION_SECONDS).toFixed(2));
        formData.append("deliveryProtocol", "hls");
        formData.append("fallbackProtocol", "mpeg-dash");
        formData.append("targetResolution", TARGET_RESOLUTION);
        formData.append("optimizeForMobile", "true");

        const response = await fetch("/api/videos", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Falha ao enviar o vídeo.");
        }

        setSuccess("Seu vídeo foi enviado! Entrará no ar assim que o processamento for concluído.");
        setTitle("");
        setDescription("");
        resetVideoState();
      } catch (submitError) {
        console.error(submitError);
        setError(submitError instanceof Error ? submitError.message : "Não foi possível concluir o envio.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [clipStart, description, resetVideoState, title, videoDuration, videoFile],
  );

  const isSubmitDisabled = !videoFile || !title.trim() || !description.trim() || isSubmitting;

  const selectionLabel = videoDuration
    ? `Enviaremos o trecho de ${formatSeconds(clipStart)} até ${formatSeconds(clipEnd)} (${Math.min(
        CLIP_DURATION_SECONDS,
        videoDuration,
      ).toFixed(0)}s).`
    : "Selecione um vídeo para habilitar o corte.";

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[minmax(280px,360px)_1fr]">
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Selecione um vídeo vertical (até 10s)</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Você pode gravar na hora ou escolher um arquivo salvo no dispositivo. Arquivos maiores serão adaptados para o formato vertical e otimizados para redes sociais.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              "relative flex aspect-[9/16] w-full max-w-[240px] items-center justify-center overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-slate-100/70 shadow-inner transition-all hover:border-slate-400 dark:border-slate-600/60 dark:bg-slate-900/40",
              videoPreviewUrl && "border-solid border-slate-200 bg-black shadow-[0_18px_48px_-20px_rgba(15,23,42,0.45)]",
            )}
          >
            {videoPreviewUrl ? (
              <video
                key={videoPreviewUrl}
                src={videoPreviewUrl}
                controls
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-full w-full flex-col items-center justify-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
              >
                <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-200">
                  Toque para selecionar
                </span>
                <span className="text-xs text-slate-500/80 dark:text-slate-400/90">ou arraste um vídeo até aqui</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              capture="environment"
              className="hidden"
              onChange={handleVideoChange}
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              Escolher vídeo
            </Button>
            {videoPreviewUrl ? (
              <Button type="button" variant="ghost" onClick={resetVideoState}>
                Trocar arquivo
              </Button>
            ) : null}
          </div>

          {videoDuration ? (
            <div className="w-full rounded-2xl bg-white/80 p-4 shadow-[0_18px_48px_-38px_rgba(15,23,42,0.55)] ring-1 ring-slate-200/80 backdrop-blur dark:bg-slate-900/70 dark:ring-white/10">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                  <span>Corte de {CLIP_DURATION_SECONDS} segundos</span>
                  <span>{selectionLabel}</span>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="relative">
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div
                      className="absolute top-0 h-2 rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400"
                      style={{
                        left: `${(clipStart / (videoDuration || CLIP_DURATION_SECONDS)) * 100}%`,
                        width: `${((clipEnd - clipStart) / (videoDuration || CLIP_DURATION_SECONDS)) * 100}%`,
                      }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={maxClipStart}
                      step={0.1}
                      value={clipStart}
                      onChange={(event) => setClipStart(Number(event.target.value))}
                      className="range-slider absolute left-0 top-1/2 h-4 w-full -translate-y-1/2"
                      disabled={maxClipStart === 0}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
                    <span>Início {formatSeconds(clipStart)}</span>
                    <span>Fim {formatSeconds(clipEnd)}</span>
                    <span>Duração detectada {videoDuration.toFixed(1)}s</span>
                  </div>
                  {maxClipStart === 0 ? (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Seu vídeo já tem {videoDuration.toFixed(1)} segundos. Usaremos o conteúdo integral caso seja menor que 10 segundos.
                    </p>
                  ) : null}
                </div>
            </div>
          ) : null}

          {orientationWarning ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
              O vídeo selecionado parece estar na horizontal. Recomendamos enviar um vídeo vertical para ocupar toda a tela nos dispositivos móveis.
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_22px_60px_-40px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-slate-900/60">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                placeholder="Conte rapidamente sobre o momento do vídeo"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Detalhe a jogada, contexto do treino ou evento. Links e menções são bem-vindos."
                value={description}
                rows={6}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white/90 p-5 text-sm text-slate-600 shadow-[0_22px_60px_-40px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-200">Preparação para redes sociais</h3>
          <ul className="list-disc space-y-2 pl-5">
            <li>O vídeo será otimizado para {TARGET_RESOLUTION} e streaming adaptativo.</li>
            <li>Entrega via protocolo HLS com fallback automático para MPEG-DASH.</li>
            <li>Qualidade ajustada para visualização em dispositivos móveis e web.</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p> : null}
          <Button type="submit" className="h-12 rounded-full text-base font-semibold" disabled={isSubmitDisabled}>
            {isSubmitting ? "Enviando vídeo..." : "Salvar e publicar"}
          </Button>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ao publicar você concorda com os termos de uso e autoriza o processamento do vídeo para streaming adaptativo.
          </p>
        </div>
      </div>

      <style jsx>{`
        input.range-slider {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }
        input.range-slider:focus {
          outline: none;
        }
        input.range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 9999px;
          background: #0284c7;
          border: 3px solid #fff;
          box-shadow: 0 6px 18px -8px rgba(14, 165, 233, 0.75);
          margin-top: -8px;
        }
        input.range-slider:disabled::-webkit-slider-thumb {
          background: #94a3b8;
          box-shadow: none;
        }
        input.range-slider::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 9999px;
          background: #0284c7;
          border: 3px solid #fff;
          box-shadow: 0 6px 18px -8px rgba(14, 165, 233, 0.75);
        }
        input.range-slider:disabled::-moz-range-thumb {
          background: #94a3b8;
          box-shadow: none;
        }
        input.range-slider::-ms-thumb {
          height: 18px;
          width: 18px;
          border-radius: 9999px;
          background: #0284c7;
          border: 3px solid #fff;
          box-shadow: 0 6px 18px -8px rgba(14, 165, 233, 0.75);
        }
        input.range-slider:disabled::-ms-thumb {
          background: #94a3b8;
          box-shadow: none;
        }
      `}</style>
    </form>
  );
}
