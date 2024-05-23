ALTER TABLE "city" ADD COLUMN "display_name" text;--> statement-breakpoint
ALTER TABLE "city" ADD COLUMN "unaccented_name" text;

CREATE EXTENSION IF NOT EXISTS unaccent;

UPDATE "city" SET "display_name" = CASE WHEN COALESCE("state", '') = '' THEN "name" || ', ' || "country" ELSE "name" || ', ' || "state" || ', ' || "country" END;
UPDATE "city" SET "unaccented_name" = unaccent("name");

UPDATE "city" SET
"name" = 'New London',
"display_name" = 'New London, CT, US',
"unaccented_name" = 'New London'
where "city_id" = '4839416';
