CREATE TABLE IF NOT EXISTS "forecast" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"location" jsonb NOT NULL,
	"date" date NOT NULL,
	"url_slug" text NOT NULL,
	"profile" jsonb NOT NULL,
	"weather" json NOT NULL,
	"suggestion" jsonb,
	"image_path" text,
	CONSTRAINT "forecast_url_slug_unique" UNIQUE("url_slug")
);
