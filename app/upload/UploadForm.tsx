"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function UploadForm() {
  const [error, setError] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(url);
      if (video.duration > 10) {
        setError("O vídeo deve ter no máximo 10 segundos.");
        if (videoRef.current) videoRef.current.value = "";
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setThumbnailPreview(dataUrl);
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    // If thumbnail not provided but generated
    if (!formData.get("thumbnail") && thumbnailPreview) {
      const res = await fetch(thumbnailPreview);
      const blob = await res.blob();
      formData.append("thumbnail", blob, "thumbnail.jpg");
    }

    const res = await fetch("/api/videos", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      setError("Falha no upload");
      return;
    }
    form.reset();
    setThumbnailPreview(null);
    alert("Upload realizado!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Título do vídeo</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" name="description" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="video">Arquivo do vídeo</Label>
        <Input
          ref={videoRef}
          id="video"
          name="video"
          type="file"
          accept="video/mp4"
          required
          onChange={handleVideoChange}
        />
        <p className="text-sm text-muted-foreground">Envie um vídeo de até 10 segundos.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="thumbnail">Thumbnail (opcional)</Label>
        <Input id="thumbnail" name="thumbnail" type="file" accept="image/*" />
        {thumbnailPreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnailPreview} alt="Prévia" loading="lazy" className="mt-2 w-32 rounded" />
        )}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex justify-end space-x-4">
        <Button type="reset" variant="outline" onClick={() => setThumbnailPreview(null)}>
          Cancelar
        </Button>
        <Button type="submit">Fazer Upload</Button>
      </div>
    </form>
  );
}
