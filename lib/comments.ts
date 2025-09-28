import { CommentItemType, Prisma } from '@prisma/client'

import prisma from '@/lib/db'
import type { CommentReply, CommentThread } from '@/types/comments'

export const commentAuthorSelect = {
  displayName: true,
  avatarUrl: true,
  user: {
    select: {
      name: true,
      image: true,
    },
  },
} satisfies Prisma.ProfileSelect

type CommentWithAuthor = Prisma.CommentGetPayload<{
  include: { authorProfile: { select: typeof commentAuthorSelect } }
}>

function resolveAuthorName(comment: CommentWithAuthor, fallback = 'Participante'): string {
  const name =
    comment.authorName?.trim() ||
    comment.authorProfile?.displayName?.trim() ||
    comment.authorProfile?.user?.name?.trim() ||
    fallback
  return name || fallback
}

function resolveAuthorAvatar(comment: CommentWithAuthor): string | null {
  return (
    comment.authorAvatarUrl ||
    comment.authorProfile?.avatarUrl ||
    comment.authorProfile?.user?.image ||
    null
  )
}

function normalizeContent(content: string | null | undefined): string | null {
  const trimmed = content?.trim()
  if (!trimmed) {
    return null
  }
  return trimmed
}

function serializeReply(comment: CommentWithAuthor): CommentReply | null {
  const content = normalizeContent(comment.content)
  if (!content) {
    return null
  }

  return {
    id: comment.id,
    authorName: resolveAuthorName(comment),
    authorAvatarUrl: resolveAuthorAvatar(comment),
    content,
    createdAt: comment.createdAt ? comment.createdAt.toISOString() : null,
  }
}

export function buildCommentThreads(comments: CommentWithAuthor[]): CommentThread[] {
  const threads: CommentThread[] = []
  const repliesByParent = new Map<string, CommentReply[]>()

  const topLevel = comments
    .filter((comment) => !comment.parentId)
    .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))

  const replies = comments
    .filter((comment) => Boolean(comment.parentId))
    .sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0))

  for (const replyComment of replies) {
    const parentId = replyComment.parentId
    if (!parentId) {
      continue
    }
    const serialized = serializeReply(replyComment)
    if (!serialized) {
      continue
    }
    const bucket = repliesByParent.get(parentId) ?? []
    bucket.push(serialized)
    repliesByParent.set(parentId, bucket)
  }

  for (const comment of topLevel) {
    const serialized = serializeReply(comment)
    if (!serialized) {
      continue
    }
    threads.push({ ...serialized, replies: repliesByParent.get(comment.id) ?? [] })
  }

  return threads
}

export async function fetchCommentThreads(
  itemType: CommentItemType,
  itemId: string,
): Promise<CommentThread[]> {
  const records = await prisma.comment.findMany({
    where: {
      itemType,
      itemId,
    },
    include: {
      authorProfile: {
        select: commentAuthorSelect,
      },
    },
  })

  return buildCommentThreads(records)
}

export async function countComments(
  itemType: CommentItemType,
  itemId: string,
): Promise<number> {
  return prisma.comment.count({
    where: {
      itemType,
      itemId,
    },
  })
}

export async function fetchSingleComment(id: string): Promise<CommentWithAuthor | null> {
  return prisma.comment.findUnique({
    where: { id },
    include: {
      authorProfile: {
        select: commentAuthorSelect,
      },
    },
  })
}

export async function createComment(
  data: Prisma.CommentCreateInput,
): Promise<CommentWithAuthor> {
  return prisma.comment.create({
    data,
    include: {
      authorProfile: {
        select: commentAuthorSelect,
      },
    },
  })
}
