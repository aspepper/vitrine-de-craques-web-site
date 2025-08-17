"use client";

import { useEffect, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Video } from '@prisma/client';

type VideoWithAuthor = Video & {
    author: {
        name: string | null;
        image: string | null;
    }
};

async function fetchVideos({ pageParam = 0 }) {
    const res = await fetch(`/api/videos?skip=${pageParam}`);
    if (!res.ok) {
        throw new Error('Network response was not ok');
    }
    return res.json();
}

export default function VideoFeed({ initialVideos }: { initialVideos: VideoWithAuthor[] }) {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['videos'],
        queryFn: fetchVideos,
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length ? allPages.length * 5 : undefined;
        },
        initialData: { pages: [initialVideos], pageParams: [0] },
    });

    const videos = data?.pages.flatMap(page => page) ?? [];
    const observer = useRef<IntersectionObserver | null>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    useEffect(() => {
        observer.current = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    const video = entry.target as HTMLVideoElement;
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
                        video.play().catch(e => console.error("Autoplay failed", e));
                    } else {
                        video.pause();
                    }
                });
            },
            { threshold: 0.7 }
        );

        videoRefs.current.forEach(video => {
            if (video) observer.current?.observe(video);
        });

        return () => {
            observer.current?.disconnect();
        };
    }, [videos]);

    // Infinite scroll trigger
    const lastVideoRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!lastVideoRef.current || !hasNextPage || isFetchingNextPage) return;

        const scrollObserver = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchNextPage();
                }
            },
            { threshold: 1.0 }
        );

        scrollObserver.observe(lastVideoRef.current);

        return () => scrollObserver.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);


    return (
        <div className="relative h-full w-full max-w-md snap-y snap-mandatory overflow-y-scroll scrollbar-hide">
            {videos.map((video, index) => (
                <div
                    key={video.id}
                    ref={index === videos.length - 1 ? lastVideoRef : null}
                    className="relative h-full w-full snap-start flex-shrink-0"
                >
                    <video
                        ref={el => (videoRefs.current[index] = el)}
                        src="/videos/sample.mp4"     
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                        poster={`https://placehold.co/1080x1920/000000/FFFFFF/png?text=${video.title}`}
                    />
                    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/50 to-transparent">
                        <div className="flex items-center gap-2">
                            <Avatar>
                                <AvatarImage src={video.author.image ?? undefined} />
                                <AvatarFallback>{video.author.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h3 className="font-bold text-white">{video.author.name}</h3>
                        </div>
                        <p className="text-white text-sm mt-2">{video.title}</p>
                        <p className="text-white text-xs mt-1 truncate">{video.description}</p>
                    </div>
                    <div className="absolute right-2 bottom-20 flex flex-col gap-4">
                        <Button variant="ghost" size="icon" className="text-white flex flex-col h-auto">
                            <Heart className="h-8 w-8" />
                            <span className="text-xs">{video.likes}</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white flex flex-col h-auto">
                            <MessageCircle className="h-8 w-8" />
                            <span className="text-xs">{video.comments}</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white flex flex-col h-auto">
                            <Share2 className="h-8 w-8" />
                            <span className="text-xs">{video.shares}</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white">
                            <MoreVertical className="h-8 w-8" />
                        </Button>
                    </div>
                </div>
            ))}
            {isFetchingNextPage && <div className="h-full w-full snap-start flex-shrink-0 flex items-center justify-center text-white">Carregando...</div>}
        </div>
    );
}
