import prisma from "@/lib/db";

export async function getFollowInfo(targetUserId: string, viewerId?: string) {
  const [followerCount, follow] = await Promise.all([
    prisma.follow.count({ where: { followingId: targetUserId } }),
    viewerId
      ? prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: viewerId,
              followingId: targetUserId,
            },
          },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  return {
    followerCount,
    isFollowing: Boolean(follow),
  };
}
