CREATE TABLE IF NOT EXISTS "city" (
	"id" uuid PRIMARY KEY NOT NULL,
	"city_id" integer NOT NULL,
	"name" text NOT NULL,
	"state" text,
	"country" text NOT NULL,
	"lon" numeric NOT NULL,
	"lat" numeric NOT NULL,
	CONSTRAINT "city_city_id_unique" UNIQUE("city_id")
);
