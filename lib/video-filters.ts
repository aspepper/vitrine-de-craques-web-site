import type { Role } from "@prisma/client";

const FILTERABLE_ROLES = [
  "ATLETA",
  "AGENTE",
  "CLUBE",
  "TORCEDOR",
  "IMPRENSA",
  "RESPONSAVEL",
] satisfies Role[];

export type FilterableRole = (typeof FILTERABLE_ROLES)[number];

export interface VideoFilters {
  category?: FilterableRole;
  state?: string;
  hashtag?: string;
  startDate?: string;
  endDate?: string;
  minAge?: number;
  maxAge?: number;
}

function normalizeSearchParams(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
) {
  if (searchParams instanceof URLSearchParams) {
    return new URLSearchParams(searchParams);
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item != null) {
          params.append(key, item);
        }
      }
    } else if (value != null) {
      params.set(key, value);
    }
  }
  return params;
}

function parseNumber(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function sanitizeHashtag(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

export function parseVideoFilters(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
): VideoFilters {
  const params = normalizeSearchParams(searchParams);

  const category = params.get("category") ?? undefined;
  const state = params.get("state")?.toUpperCase() ?? undefined;
  const hashtag = sanitizeHashtag(params.get("hashtag"));
  const startDate = params.get("startDate") ?? undefined;
  const endDate = params.get("endDate") ?? undefined;
  const minAge = parseNumber(params.get("minAge"));
  const maxAge = parseNumber(params.get("maxAge"));

  return {
    category: FILTERABLE_ROLES.includes(category as Role)
      ? (category as FilterableRole)
      : undefined,
    state,
    hashtag,
    startDate,
    endDate,
    minAge,
    maxAge,
  };
}

export function buildVideoQueryString(filters: VideoFilters) {
  const params = new URLSearchParams();

  if (filters.category) {
    params.set("category", filters.category);
  }
  if (filters.state) {
    params.set("state", filters.state);
  }
  if (filters.hashtag) {
    params.set("hashtag", filters.hashtag.replace(/^#+/, "#"));
  }
  if (filters.startDate) {
    params.set("startDate", filters.startDate);
  }
  if (filters.endDate) {
    params.set("endDate", filters.endDate);
  }
  if (typeof filters.minAge === "number") {
    params.set("minAge", filters.minAge.toString());
  }
  if (typeof filters.maxAge === "number") {
    params.set("maxAge", filters.maxAge.toString());
  }

  return params.toString();
}
