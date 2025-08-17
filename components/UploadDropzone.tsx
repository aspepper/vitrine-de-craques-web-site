"use client";

import { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { CheckCircle, AlertTriangle, XCircle, Loader, UploadCloud, Scissors } from 'lucide-react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { useRouter } from 'next/navigation';

type CopyrightStatus = 'idle' | 'checking' | 'ok' | 'infringement' | 'blocked';

export default function UploadDropzone() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [copyrightStatus, setCopyrightStatus] = useState<CopyrightStatus>('idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const ffmpegRef = useRef(new FFmpeg());
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const videoFile = acceptedFiles[0];
    if (videoFile) {
      setFile(videoFile);
      setVideoUrl(URL.createObjectURL(videoFile));
      setCopyrightStatus('idle');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.avi', '.webm'] },
    maxFiles: 1,
  });

  const handleCopyrightCheck = () => {
    setCopyrightStatus('checking');
    setTimeout(() => {
      const statuses: CopyrightStatus[] = ['ok', 'infringement', 'blocked'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setCopyrightStatus(randomStatus);
    }, 2000);
  };

  const handleUploadAndTrim = async () => {
    if (!file || copyrightStatus !== 'ok') {
      alert("Por favor, selecione um arquivo e verifique os direitos autorais.");
      return;
    }

    setIsProcessing(true);
    setProgressMessage('Carregando FFmpeg...');
    const ffmpeg = ffmpegRef.current;
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    
    setProgressMessage('Processando vídeo...');
    await ffmpeg.writeFile(file.name, await fetchFile(file));
    
    // Trim to first 10 seconds
    await ffmpeg.exec(['-i', file.name, '-t', '10', '-c', 'copy', 'output.mp4']);
    
    const data = await ffmpeg.readFile('output.mp4');
    const trimmedBlob = new Blob([data], { type: 'video/mp4' });

    // Here you would upload `trimmedBlob` to your server/storage
    // For this demo, we'll simulate an upload and redirect.
    setProgressMessage('Enviando para a plataforma...');
    
    // This is where you'd call your API route
    // const formData = new FormData();
    // formData.append('video', trimmedBlob);
    // formData.append('title', title);
    // formData.append('description', description);
    // await fetch('/api/upload', { method: 'POST', body: formData });

    setTimeout(() => {
      setIsProcessing(false);
      router.push('/feeds');
    }, 2000);
  };

  const renderCopyrightStatus = () => {
    switch (copyrightStatus) {
      case 'checking':
        return <div className="flex items-center text-blue-500"><Loader className="mr-2 h-4 w-4 animate-spin" /> Verificando...</div>;
      case 'ok':
        return <div className="flex items-center text-success"><CheckCircle className="mr-2 h-4 w-4" /> Verificação OK</div>;
      case 'infringement':
        return <div className="flex items-center text-warning"><AlertTriangle className="mr-2 h-4 w-4" /> Possível infração detectada</div>;
      case 'blocked':
        return <div className="flex items-center text-error"><XCircle className="mr-2 h-4 w-4" /> Bloqueado. Conteúdo protegido.</div>;
      default:
        return null;
    }
  };

  if (isProcessing) {
    return (
        <Card>
            <CardContent className="p-12 text-center">
                <Loader className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-semibold">{progressMessage}</p>
                <p className="text-muted-foreground">Por favor, aguarde...</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        {!file ? (
          <div {...getRootProps()} className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer hover:border-primary transition-colors">
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
            {isDragActive ? (
              <p className="mt-4 text-lg">Solte o vídeo aqui...</p>
            ) : (
              <p className="mt-4 text-lg">Arraste e solte um vídeo aqui, ou clique para selecionar</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">MP4, MOV, AVI, WEBM</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Pré-visualização</h3>
              <video src={videoUrl!} controls className="w-full rounded-lg" />
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-muted-foreground mb-1">Título</label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Golaço de falta" />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-muted-foreground mb-1">Descrição</label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva sua jogada" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button onClick={handleCopyrightCheck} variant="outline" className="w-full sm:w-auto">
                Analisar Direitos Autorais
              </Button>
              <div className="text-sm font-medium">{renderCopyrightStatus()}</div>
            </div>
            <div className="border-t pt-6 flex justify-end gap-4">
                <Button variant="ghost" onClick={() => { setFile(null); setVideoUrl(null); }}>Cancelar</Button>
                <Button onClick={handleUploadAndTrim} disabled={copyrightStatus !== 'ok'}>
                    <Scissors className="mr-2 h-4 w-4" /> Cortar e Enviar (10s)
                </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
