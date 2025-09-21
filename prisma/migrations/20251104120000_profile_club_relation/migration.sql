-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "likesCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "News" ADD COLUMN     "likesCount" INTEGER NOT NULL DEFAULT 0;

-- Prepare profile favorite club relation
ALTER TABLE "Profile" ADD COLUMN     "clube_new" TEXT;

UPDATE "Profile"
SET "clube_new" = (
  SELECT "Times"."id"
  FROM "Times"
  WHERE LOWER("Times"."clube") = LOWER("Profile"."clube")
)
WHERE "Profile"."clube" IS NOT NULL;

ALTER TABLE "Profile" DROP COLUMN     "clube";
ALTER TABLE "Profile" RENAME COLUMN "clube_new" TO "clube";

ALTER TABLE "Profile"
ADD CONSTRAINT "Profile_clube_fkey" FOREIGN KEY ("clube") REFERENCES "Times"("id") ON DELETE SET NULL ON UPDATE CASCADE;
