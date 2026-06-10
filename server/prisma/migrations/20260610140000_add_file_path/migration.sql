-- Backfill file paths from existing file names before enforcing the new uniqueness rule.
ALTER TABLE "File" ADD COLUMN IF NOT EXISTS "path" TEXT;

UPDATE "File"
SET "path" = COALESCE("path", "name")
WHERE "path" IS NULL OR "path" = '';

ALTER TABLE "File"
ALTER COLUMN "path" SET NOT NULL;

DROP INDEX IF EXISTS "File_roomId_name_key";
CREATE UNIQUE INDEX "File_roomId_path_key" ON "File"("roomId", "path");