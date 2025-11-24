"use client";

import Image, { type ImageProps } from "next/image";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type SyntheticEvent,
  type VideoHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

const FALLBACK_SRC = "/place-holder-image-error.png";

export type SafeImageProps = ImageProps & {
  fallbackSrc?: string;
};

export function SafeImage({
  alt,
  src,
  onError,
  fallbackSrc = FALLBACK_SRC,
  ...rest
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState<ImageProps["src"]>(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
    onError?.(event);
  };

  return <Image {...rest} alt={alt} src={currentSrc} onError={handleError} />;
}

export type SafeVideoProps = VideoHTMLAttributes<HTMLVideoElement> & {
  fallbackPoster?: string;
  fallbackAlt?: string;
};

export const SafeVideo = forwardRef<HTMLVideoElement | null, SafeVideoProps>(
  function SafeVideo(
    {
      className,
      onError,
      poster,
      fallbackPoster = FALLBACK_SRC,
      fallbackAlt = "Mídia indisponível",
      ...rest
    }: SafeVideoProps,
    forwardedRef,
  ) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [hasError, setHasError] = useState(false);
    const [currentPoster, setCurrentPoster] = useState<string | undefined>(
      typeof poster === "string" ? poster : undefined,
    );

    useImperativeHandle<HTMLVideoElement | null>(
      forwardedRef,
      () => videoRef.current,
    );

    useEffect(() => {
      setHasError(false);
      setCurrentPoster(typeof poster === "string" ? poster : undefined);
    }, [poster, rest.src]);

    useEffect(() => {
      if (hasError) {
        if (videoRef.current) {
          videoRef.current.pause();
        }
        videoRef.current = null;
      }
    }, [hasError]);

    const handleError = (event: SyntheticEvent<HTMLVideoElement>) => {
      setHasError(true);
      onError?.(event);
    };

    if (hasError) {
      return (
        <div className={cn("relative", className)}>
          <SafeImage
            src={fallbackPoster}
            alt={fallbackAlt}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      );
    }

    return (
      <video
        {...rest}
        ref={videoRef}
        className={className}
        poster={currentPoster}
        onError={handleError}
      />
    );
  },
);
