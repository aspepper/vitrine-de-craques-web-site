"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";

import { ArticleActionBar, type ArticleActionType } from "@/components/ArticleActionBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CommentReply, CommentThread } from "@/types/comments";

const commentDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const commentCountFormatter = new Intl.NumberFormat("pt-BR");

export interface ArticleInteractiveLabels {
  commentTitle?: string;
  commentDescription?: string;
  emptyStateMessage?: string;
  commentPlaceholder?: string;
  replyPlaceholder?: string;
  replyAriaLabel?: (authorName: string) => string;
  publishCommentLabel?: string;
  cancelReplyLabel?: string;
  sendReplyLabel?: string;
  interactionsLabel?: (formattedCount: string, total: number) => string;
}

export interface ArticleInteractiveProps {
  articleSlug: string;
  shareUrl: string;
  itemType: ArticleActionType;
  storageKeyPrefix?: string;
  initialComments?: CommentThread[];
  actionBarClassName?: string;
  initialMetrics?: {
    likes?: number;
    saves?: number;
    shares?: number;
    comments?: number;
  };
  labels?: ArticleInteractiveLabels;
  children: React.ReactNode;
}

function initialsFromName(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "AG"
  ).slice(0, 2);
}

export function ArticleInteractive({
  articleSlug,
  shareUrl,
  itemType,
  storageKeyPrefix: _storageKeyPrefix = "vitrine:articles:comments",
  initialComments = [],
  actionBarClassName = "justify-center gap-8",
  initialMetrics,
  labels,
  children,
}: ArticleInteractiveProps) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [comments, setComments] = useState<CommentThread[]>(initialComments);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [replySubmittingId, setReplySubmittingId] = useState<string | null>(null);
  const [replyErrors, setReplyErrors] = useState<Record<string, string | null>>({});
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const replyRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  useEffect(() => {
    if (isAuthenticated) {
      setFeedbackMessage(null);
    }
  }, [isAuthenticated]);

  const {
    commentTitle = "Comentários",
    commentDescription = "Compartilhe suas impressões sobre este conteúdo.",
    emptyStateMessage = "Seja o primeiro a comentar e iniciar a conversa.",
    commentPlaceholder = "Escreva um comentário construtivo",
    replyPlaceholder = "Responder a este comentário",
    replyAriaLabel = (authorName: string) => `Responder ao comentário de ${authorName}`,
    publishCommentLabel = "Publicar comentário",
    cancelReplyLabel = "Cancelar",
    sendReplyLabel = "Enviar resposta",
    interactionsLabel = (formattedCount: string, total: number) =>
      `${formattedCount} ${total === 1 ? "interação" : "interações"}`,
  } = labels ?? {};

  const commentsEndpoint = useMemo(() => {
    const segment = itemType === "news" ? "noticias" : itemType === "game" ? "games" : null;
    if (!segment) {
      return null;
    }
    return `/api/${segment}/${encodeURIComponent(articleSlug)}/comments`;
  }, [articleSlug, itemType]);

  useEffect(() => {
    if (!commentsEndpoint) {
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function loadComments() {
      setIsLoadingComments(true);
      try {
        const response = await fetch(commentsEndpoint, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }

        const data = (await response.json()) as CommentThread[];
        if (!cancelled) {
          setComments(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Erro ao carregar comentários", error);
          setFeedbackMessage(
            "Não foi possível carregar os comentários mais recentes. Exibindo a última versão conhecida.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingComments(false);
        }
      }
    }

    loadComments();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [commentsEndpoint]);

  useEffect(() => {
    if (!activeReplyId) {
      return;
    }
    const field = replyRefs.current[activeReplyId];
    field?.focus();
  }, [activeReplyId]);

  const totalInteractions = useMemo(
    () =>
      comments.reduce(
        (total, comment) => total + 1 + comment.replies.length,
        0,
      ),
    [comments],
  );

  const formattedInteractions = useMemo(
    () => commentCountFormatter.format(Math.max(totalInteractions, 0)),
    [totalInteractions],
  );

  const displayedCommentMetric = useMemo(
    () => Math.max(initialMetrics?.comments ?? 0, totalInteractions),
    [initialMetrics?.comments, totalInteractions],
  );

  const commentsAreDisabled = !isAuthenticated;
  const loginHref = "/login";

  const handleSubmitComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!commentsEndpoint) {
      return;
    }

    const content = commentInput.trim();
    if (!content) {
      commentTextareaRef.current?.setCustomValidity("Informe um comentário antes de enviar");
      commentTextareaRef.current?.reportValidity();
      return;
    }

    if (!isAuthenticated) {
      setFeedbackMessage("Faça login para publicar comentários.");
      return;
    }

    commentTextareaRef.current?.setCustomValidity("");
    setIsSubmittingComment(true);
    setFeedbackMessage(null);

    try {
      const response = await fetch(commentsEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (response.status === 401) {
        setFeedbackMessage("Faça login para publicar comentários.");
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to publish comment (${response.status})`);
      }

      const data = (await response.json()) as {
        comment?: CommentThread;
        reply?: CommentReply;
        parentId?: string;
        totalCount?: number;
      };

      if (data.comment) {
        setComments((current) => [data.comment!, ...current]);
      }

      setCommentInput("");
      requestAnimationFrame(() => {
        commentTextareaRef.current?.focus();
      });
    } catch (error) {
      console.error("Erro ao publicar comentário", error);
      setFeedbackMessage("Não foi possível publicar o comentário. Tente novamente em instantes.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleToggleReply = (commentId: string) => {
    if (!isAuthenticated) {
      setFeedbackMessage("Faça login para responder comentários.");
      return;
    }

    setActiveReplyId((current) => (current === commentId ? null : commentId));
    setReplyInputs((current) => {
      if (current[commentId] !== undefined) {
        return current;
      }
      return { ...current, [commentId]: "" };
    });
    setReplyErrors((current) => ({ ...current, [commentId]: null }));
    const field = replyRefs.current[commentId];
    field?.setCustomValidity("");
  };

  const handleReplyInputChange = (commentId: string, value: string) => {
    setReplyInputs((current) => ({ ...current, [commentId]: value }));
    setReplyErrors((current) => ({ ...current, [commentId]: null }));
    const field = replyRefs.current[commentId];
    field?.setCustomValidity("");
  };

  const handleSubmitReply = async (
    event: React.FormEvent<HTMLFormElement>,
    commentId: string,
  ) => {
    event.preventDefault();
    if (!commentsEndpoint) {
      return;
    }

    if (!isAuthenticated) {
      setFeedbackMessage("Faça login para responder comentários.");
      return;
    }

    const content = replyInputs[commentId]?.trim() ?? "";
    const field = replyRefs.current[commentId];
    if (!content) {
      field?.setCustomValidity("Informe uma resposta antes de enviar");
      field?.reportValidity();
      return;
    }

    field?.setCustomValidity("");
    setReplySubmittingId(commentId);
    setReplyErrors((current) => ({ ...current, [commentId]: null }));

    try {
      const response = await fetch(commentsEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId: commentId }),
      });

      if (response.status === 401) {
        setFeedbackMessage("Faça login para responder comentários.");
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to publish reply (${response.status})`);
      }

      const data = (await response.json()) as {
        reply?: CommentReply;
        parentId?: string;
        totalCount?: number;
      };

      if (data.reply && data.parentId) {
        setComments((current) =>
          current.map((comment) => {
            if (comment.id !== data.parentId) {
              return comment;
            }
            return {
              ...comment,
              replies: [...comment.replies, data.reply!],
            } satisfies CommentThread;
          }),
        );
      }

      setReplyInputs((current) => ({ ...current, [commentId]: "" }));
      setActiveReplyId(null);
    } catch (error) {
      console.error("Erro ao publicar resposta", error);
      setReplyErrors((current) => ({
        ...current,
        [commentId]: "Não foi possível publicar a resposta. Tente novamente.",
      }));
    } finally {
      setReplySubmittingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <ArticleActionBar
        itemId={articleSlug}
        itemSlug={articleSlug}
        itemType={itemType}
        shareUrl={shareUrl}
        commentHref="#comentarios"
        className={actionBarClassName}
        metrics={{
          comments: displayedCommentMetric,
          likes: initialMetrics?.likes,
          saves: initialMetrics?.saves,
          shares: initialMetrics?.shares,
        }}
      />

      {children}

      <section
        id="comentarios"
        className="space-y-6 rounded-3xl border border-border/70 bg-background/60 px-6 py-8 text-left shadow-[0_24px_72px_-48px_rgba(15,23,42,0.65)] backdrop-blur"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">{commentTitle}</h2>
            <p className="text-sm text-muted-foreground">{commentDescription}</p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {interactionsLabel(formattedInteractions, totalInteractions)}
          </span>
        </div>

        <form onSubmit={handleSubmitComment} className="flex flex-col gap-4">
          <Textarea
            ref={commentTextareaRef}
            value={commentInput}
            onChange={(event) => {
              setCommentInput(event.target.value);
              commentTextareaRef.current?.setCustomValidity("");
            }}
            placeholder={commentPlaceholder}
            className="min-h-[120px] rounded-3xl border border-border/60 bg-background/80 text-base text-foreground placeholder:text-muted-foreground"
            aria-label="Adicionar comentário"
            disabled={isSubmittingComment || commentsAreDisabled}
            required
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            {!isAuthenticated ? (
              <p className="text-xs text-muted-foreground">
                Faça login para comentar. {" "}
                <Link href={loginHref} className="text-emerald-600 hover:underline">
                  Acessar conta
                </Link>
              </p>
            ) : null}
            <Button
              type="submit"
              className="h-11 rounded-full bg-emerald-500 px-8 text-sm font-semibold text-white transition hover:bg-emerald-500/90"
              disabled={isSubmittingComment || commentsAreDisabled}
            >
              {isSubmittingComment ? "Enviando..." : publishCommentLabel}
            </Button>
          </div>
        </form>

        {feedbackMessage ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {feedbackMessage}
          </div>
        ) : null}

        {isLoadingComments && comments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/70 bg-background/40 px-6 py-8 text-center text-muted-foreground">
            Carregando comentários...
          </div>
        ) : comments.length > 0 ? (
          <ul className="flex flex-col gap-6">
            {comments.map((comment) => {
              const initials = initialsFromName(comment.authorName);
              const commentDate = comment.createdAt ? new Date(comment.createdAt) : null;
              const formattedDate = commentDate ? commentDateFormatter.format(commentDate) : null;
              const isReplySubmitting = replySubmittingId === comment.id;

              return (
                <li
                  key={comment.id}
                  className="space-y-4 rounded-3xl border border-border/60 bg-background/40 px-5 py-5 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.7)] backdrop-blur"
                >
                  <div className="flex gap-4">
                    <Avatar className="h-12 w-12">
                      {comment.authorAvatarUrl ? (
                        <AvatarImage src={comment.authorAvatarUrl} alt={comment.authorName} />
                      ) : null}
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground">{comment.authorName}</span>
                        {formattedDate ? (
                          <span className="text-xs text-muted-foreground">{formattedDate}</span>
                        ) : null}
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/90">{comment.content}</p>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleReply(comment.id)}
                          className="h-8 rounded-full border border-emerald-100 bg-emerald-50 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 transition hover:bg-emerald-100"
                          disabled={!isAuthenticated}
                        >
                          {activeReplyId === comment.id ? cancelReplyLabel : "Responder"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {activeReplyId === comment.id ? (
                    <form
                      onSubmit={(event) => handleSubmitReply(event, comment.id)}
                      className="rounded-2xl border border-border/50 bg-background/70 p-4"
                    >
                      <Textarea
                        ref={(node) => {
                          replyRefs.current[comment.id] = node;
                        }}
                        value={replyInputs[comment.id] ?? ""}
                        onChange={(event) => handleReplyInputChange(comment.id, event.target.value)}
                        placeholder={replyPlaceholder}
                        className="min-h-[96px] rounded-2xl border border-border/60 bg-background/80 text-sm text-foreground placeholder:text-muted-foreground"
                        aria-label={replyAriaLabel(comment.authorName)}
                        disabled={isReplySubmitting}
                        required
                      />
                      {replyErrors[comment.id] ? (
                        <p className="mt-2 text-xs text-amber-600">{replyErrors[comment.id]}</p>
                      ) : null}
                      <div className="mt-3 flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveReplyId(null)}
                          className="h-9 rounded-full border border-border/60 bg-background px-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:bg-muted/60"
                        >
                          {cancelReplyLabel}
                        </Button>
                        <Button
                          type="submit"
                          className="h-9 rounded-full bg-emerald-500 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-emerald-500/90"
                          disabled={isReplySubmitting}
                        >
                          {isReplySubmitting ? "Enviando..." : sendReplyLabel}
                        </Button>
                      </div>
                    </form>
                  ) : null}

                  {comment.replies.length > 0 ? (
                    <ul className="flex flex-col gap-3 border-l border-border/50 pl-6">
                      {comment.replies.map((reply) => {
                        const replyInitials = initialsFromName(reply.authorName);
                        const replyDate = reply.createdAt ? new Date(reply.createdAt) : null;
                        const formattedReplyDate = replyDate
                          ? commentDateFormatter.format(replyDate)
                          : null;

                        return (
                          <li
                            key={reply.id}
                            className="flex gap-3 rounded-2xl bg-background/70 px-4 py-3 shadow-[0_16px_48px_-48px_rgba(15,23,42,0.75)] backdrop-blur"
                          >
                            <Avatar className="h-10 w-10">
                              {reply.authorAvatarUrl ? (
                                <AvatarImage src={reply.authorAvatarUrl} alt={reply.authorName} />
                              ) : null}
                              <AvatarFallback>{replyInitials}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-1 flex-col gap-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-foreground">{reply.authorName}</span>
                                {formattedReplyDate ? (
                                  <span className="text-xs text-muted-foreground">{formattedReplyDate}</span>
                                ) : null}
                              </div>
                              <p className="text-sm leading-relaxed text-foreground/90">{reply.content}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-3xl border border-dashed border-border/70 bg-background/40 px-6 py-8 text-center text-muted-foreground">
            {emptyStateMessage}
          </div>
        )}
      </section>
    </div>
  );
}
