/*
  Warnings:

  - Added the required column `updatedAt` to the `Club` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."VideoVisibilityStatus" AS ENUM ('PUBLIC', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."VideoBlockAppealStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('VIDEO_BLOCK', 'VIDEO_APPEAL_UPDATE', 'USER_BLOCK');

-- AlterTable
ALTER TABLE "public"."Club" ADD COLUMN     "city" TEXT,
ADD COLUMN     "colors" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "crestUrl" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "foundedAt" TIMESTAMP(3),
ADD COLUMN     "nickname" TEXT,
ADD COLUMN     "stadium" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "blockedAt" TIMESTAMP(3),
ADD COLUMN     "blockedByAdminId" TEXT,
ADD COLUMN     "blockedReason" TEXT,
ADD COLUMN     "lastAppLoginAt" TIMESTAMP(3),
ADD COLUMN     "lastWebLoginAt" TIMESTAMP(3),
ADD COLUMN     "status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "public"."Video" ADD COLUMN     "blockAppealAt" TIMESTAMP(3),
ADD COLUMN     "blockAppealMessage" TEXT,
ADD COLUMN     "blockAppealResolvedAt" TIMESTAMP(3),
ADD COLUMN     "blockAppealResponse" TEXT,
ADD COLUMN     "blockAppealStatus" "public"."VideoBlockAppealStatus",
ADD COLUMN     "blockReason" TEXT,
ADD COLUMN     "blockedAt" TIMESTAMP(3),
ADD COLUMN     "blockedByAdminId" TEXT,
ADD COLUMN     "visibilityStatus" "public"."VideoVisibilityStatus" NOT NULL DEFAULT 'PUBLIC';

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_blockedByAdminId_fkey" FOREIGN KEY ("blockedByAdminId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Video" ADD CONSTRAINT "Video_blockedByAdminId_fkey" FOREIGN KEY ("blockedByAdminId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
