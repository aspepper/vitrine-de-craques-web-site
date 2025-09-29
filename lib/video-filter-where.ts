import type { Prisma, Role } from "@prisma/client";

import type { VideoFilters } from "./video-filters";

function formatBirthDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function birthDateFromAge(age: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setFullYear(date.getFullYear() - age);
  return date;
}

function normalizeHashtag(hashtag: string) {
  return hashtag.startsWith("#") ? hashtag : `#${hashtag}`;
}

export function buildVideoWhere(filters: VideoFilters): Prisma.VideoWhereInput {
  const and: Prisma.VideoWhereInput[] = [];

  if (filters.category) {
    and.push({
      user: {
        profile: {
          role: filters.category as Role,
        },
      },
    });
  }

  if (filters.state) {
    and.push({
      user: {
        profile: {
          uf: {
            equals: filters.state,
            mode: "insensitive",
          },
        },
      },
    });
  }

  if (filters.hashtag) {
    const normalized = normalizeHashtag(filters.hashtag);
    const canonical = normalized.replace(/^#+/, "#");
    const plain = canonical.replace(/^#/, "");

    const hashtagConditions: Prisma.VideoWhereInput["OR"] = [
      {
        title: {
          contains: canonical,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: canonical,
          mode: "insensitive",
        },
      },
    ];

    if (plain) {
      hashtagConditions.push(
        {
          title: {
            contains: plain,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: plain,
            mode: "insensitive",
          },
        },
      );
    }

    and.push({ OR: hashtagConditions });
  }

  if (filters.startDate) {
    const start = new Date(filters.startDate);
    if (!Number.isNaN(start.getTime())) {
      and.push({
        createdAt: {
          gte: start,
        },
      });
    }
  }

  if (filters.endDate) {
    const end = new Date(filters.endDate);
    if (!Number.isNaN(end.getTime())) {
      end.setHours(23, 59, 59, 999);
      and.push({
        createdAt: {
          lte: end,
        },
      });
    }
  }

  if (typeof filters.minAge === "number" && Number.isFinite(filters.minAge)) {
    const maxBirthDate = birthDateFromAge(filters.minAge);
    and.push({
      user: {
        profile: {
          nascimento: {
            lte: formatBirthDate(maxBirthDate),
          },
        },
      },
    });
  }

  if (typeof filters.maxAge === "number" && Number.isFinite(filters.maxAge)) {
    const minBirthDate = birthDateFromAge(filters.maxAge);
    and.push({
      user: {
        profile: {
          nascimento: {
            gte: formatBirthDate(minBirthDate),
          },
        },
      },
    });
  }

  if (and.length === 0) {
    return {};
  }

  return { AND: and };
}
