CREATE TABLE IF NOT EXISTS "forecast" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone,
	"location" jsonb NOT NULL,
	"date" date NOT NULL,
	"url_slug" text NOT NULL,
	"profile" jsonb NOT NULL,
	"weather" json NOT NULL,
	"suggestion" jsonb,
	"image_id" uuid,
	CONSTRAINT "forecast_url_slug_unique" UNIQUE("url_slug")
);

alter table "public"."forecast" enable row level security;

create policy "Enable read access for all users"
on "public"."forecast"
as permissive
for select
to public
using (true);
