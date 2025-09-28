export interface CommentReply {
  id: string
  authorName: string
  authorAvatarUrl: string | null
  content: string
  createdAt: string | null
}

export interface CommentThread extends CommentReply {
  replies: CommentReply[]
}
