-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Video" DROP CONSTRAINT "Video_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Club" DROP CONSTRAINT "Club_confederationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."News" DROP CONSTRAINT "News_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Game" DROP CONSTRAINT "Game_authorId_fkey";

-- DropTable
DROP TABLE "public"."Account";

-- DropTable
DROP TABLE "public"."Session";

-- DropTable
DROP TABLE "public"."User";

-- DropTable
DROP TABLE "public"."VerificationToken";

-- DropTable
DROP TABLE "public"."Profile";

-- DropTable
DROP TABLE "public"."Video";

-- DropTable
DROP TABLE "public"."Confederation";

-- DropTable
DROP TABLE "public"."Club";

-- DropTable
DROP TABLE "public"."News";

-- DropTable
DROP TABLE "public"."Game";

-- DropTable
DROP TABLE "public"."Times";

-- DropEnum
DROP TYPE "public"."Role";

