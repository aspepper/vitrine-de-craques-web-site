import VideoFeed from "@/components/VideoFeed";
import prisma from "@/lib/prisma";

async function getInitialVideos() {
    const videos = await prisma.video.findMany({
        take: 5,
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            author: {
                select: {
                    name: true,
                    image: true,
                }
            }
        }
    });
    return videos;
}


export default async function FeedsPage() {
    const initialVideos = await getInitialVideos();

    return (
        <div className="h-[calc(100vh-3.5rem)] flex justify-center bg-black">
            <VideoFeed initialVideos={initialVideos} />
        </div>
    );
}
