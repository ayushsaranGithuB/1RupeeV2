DO $$ BEGIN
    CREATE TYPE "campaign_category" AS ENUM ('EDUCATION', 'HEALTHCARE', 'ANIMAL_WELFARE', 'ENVIRONMENT', 'HUNGER', 'WATER_SANITATION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "campaigns"
ADD COLUMN IF NOT EXISTS "category" "campaign_category";
