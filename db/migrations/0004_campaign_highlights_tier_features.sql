ALTER TABLE "campaigns"
ADD COLUMN "impact_highlights" jsonb;

ALTER TABLE "campaign_tiers"
ADD COLUMN "features" jsonb,
ADD COLUMN "featured" boolean DEFAULT false NOT NULL;
