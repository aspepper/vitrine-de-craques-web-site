-- AlterTable
ALTER TABLE "public"."Game" ADD COLUMN     "likesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "savesCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."News" ADD COLUMN     "savesCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."NewsLike" (
    "id" TEXT NOT NULL,
    "newsId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NewsSave" (
    "id" TEXT NOT NULL,
    "newsId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsSave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GameLike" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GameSave" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameSave_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsLike_newsId_userId_key" ON "public"."NewsLike"("newsId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsSave_newsId_userId_key" ON "public"."NewsSave"("newsId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "GameLike_gameId_userId_key" ON "public"."GameLike"("gameId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "GameSave_gameId_userId_key" ON "public"."GameSave"("gameId", "userId");

-- AddForeignKey
ALTER TABLE "public"."NewsLike" ADD CONSTRAINT "NewsLike_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "public"."News"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NewsLike" ADD CONSTRAINT "NewsLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NewsSave" ADD CONSTRAINT "NewsSave_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "public"."News"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NewsSave" ADD CONSTRAINT "NewsSave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameLike" ADD CONSTRAINT "GameLike_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameLike" ADD CONSTRAINT "GameLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameSave" ADD CONSTRAINT "GameSave_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameSave" ADD CONSTRAINT "GameSave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
