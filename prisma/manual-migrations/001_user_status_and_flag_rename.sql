-- Phase 3 commit 3: replace User.isBanned (Boolean) with status enum (UserStatus),
-- and rename FlagStatus values OPEN -> PENDING, ACTIONED -> RESOLVED.
--
-- Applied via: pnpm prisma db execute --file=prisma/manual-migrations/001_user_status_and_flag_rename.sql
-- Required Postgres >= 12 for ALTER TYPE RENAME VALUE inside a transaction (Neon meets this).

BEGIN;

-- 1. New UserStatus enum.
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'WARNED', 'SUSPENDED', 'BANNED');

-- 2. Add column with default ACTIVE.
ALTER TABLE "User" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- 3. Backfill: anyone with isBanned=true becomes BANNED.
UPDATE "User" SET "status" = 'BANNED' WHERE "isBanned" = true;

-- 4. Drop the legacy column.
ALTER TABLE "User" DROP COLUMN "isBanned";

-- 5. Rename FlagStatus values.
-- REVIEWING and DISMISSED kept as-is. Dropping enum values is destructive in
-- Postgres (requires recreate-and-swap) and the spec does not require removing
-- REVIEWING — left intact.
ALTER TYPE "FlagStatus" RENAME VALUE 'OPEN' TO 'PENDING';
ALTER TYPE "FlagStatus" RENAME VALUE 'ACTIONED' TO 'RESOLVED';

COMMIT;
