export type InterestedAthlete = {
  id?: string;
  name: string;
  club?: string;
  position?: string;
  avatarUrl?: string;
};

export function parseInterestedAthletes(data: unknown): InterestedAthlete[] {
  if (!data || typeof data !== "object") {
    return [];
  }

  const possibleList = (data as { interestedAthletes?: unknown }).interestedAthletes;
  if (!Array.isArray(possibleList)) {
    return [];
  }

  return possibleList
    .filter((item): item is InterestedAthlete => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Record<string, unknown>;
      return typeof candidate.name === "string" && candidate.name.trim().length > 0;
    })
    .map((item) => {
      const candidate = item as Record<string, unknown>;
      return {
        id: typeof candidate.id === "string" ? candidate.id : undefined,
        name: String(candidate.name),
        club: typeof candidate.club === "string" ? candidate.club : undefined,
        position: typeof candidate.position === "string" ? candidate.position : undefined,
        avatarUrl: typeof candidate.avatarUrl === "string" ? candidate.avatarUrl : undefined,
      } satisfies InterestedAthlete;
    });
}
