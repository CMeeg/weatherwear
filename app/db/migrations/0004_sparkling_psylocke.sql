-- All data is test data at this point so no need to migrate it
DELETE FROM "forecast";

ALTER TABLE "forecast" ALTER COLUMN "weather" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "forecast" ADD COLUMN "city_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "forecast" DROP COLUMN IF EXISTS "location";
