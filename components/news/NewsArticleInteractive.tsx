"use client";

import {
  ArticleInteractive,
  ArticleInteractiveProps,
  CommentReply,
  CommentThread,
} from "@/components/articles/ArticleInteractive";

export type { CommentReply, CommentThread };

export type NewsArticleInteractiveProps = Omit<
  ArticleInteractiveProps,
  "itemType" | "storageKeyPrefix"
>;

export function NewsArticleInteractive({ labels, ...props }: NewsArticleInteractiveProps) {
  return (
    <ArticleInteractive
      {...props}
      itemType="news"
      storageKeyPrefix="vitrine:news:comments"
      labels={{
        commentDescription: "Compartilhe análises e impressões sobre esta reportagem.",
        emptyStateMessage: "Seja o primeiro a comentar esta notícia e iniciar a conversa.",
        commentPlaceholder: "Escreva um comentário construtivo",
        replyPlaceholder: "Responder a este comentário",
        publishCommentLabel: "Publicar comentário",
        cancelReplyLabel: "Cancelar",
        sendReplyLabel: "Enviar resposta",
        interactionsLabel: (formattedCount, total) =>
          `${formattedCount} ${total === 1 ? "interação" : "interações"}`,
        ...labels,
      }}
    />
  );
}
