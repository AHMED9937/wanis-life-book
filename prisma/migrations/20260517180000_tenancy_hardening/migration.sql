-- CareHome onboarding flag
ALTER TABLE "care_homes" ADD COLUMN IF NOT EXISTS "setup_completed" BOOLEAN NOT NULL DEFAULT false;

-- Resident ownership
ALTER TABLE "residents" ADD COLUMN IF NOT EXISTS "created_by_id" UUID;

ALTER TABLE "residents" DROP CONSTRAINT IF EXISTS "residents_created_by_id_fkey";
ALTER TABLE "residents" ADD CONSTRAINT "residents_created_by_id_fkey"
  FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "residents_created_by_id_idx" ON "residents"("created_by_id");

-- Existing demo / legacy homes are considered set up
UPDATE "care_homes" SET "setup_completed" = true WHERE "name" IN ('Wanis Demo', 'Unassigned');
