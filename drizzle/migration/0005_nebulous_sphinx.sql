CREATE TABLE "showtimes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"movie_id" integer NOT NULL,
	"hall_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hall" RENAME TO "halls";--> statement-breakpoint
ALTER TABLE "seats" RENAME COLUMN "hall" TO "halls";--> statement-breakpoint
ALTER TABLE "halls" DROP CONSTRAINT "hall_name_unique";--> statement-breakpoint
ALTER TABLE "seats" DROP CONSTRAINT "seats_hall_hall_id_fk";
--> statement-breakpoint
ALTER TABLE "seats" ADD CONSTRAINT "seats_halls_halls_id_fk" FOREIGN KEY ("halls") REFERENCES "public"."halls"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "halls" ADD CONSTRAINT "halls_name_unique" UNIQUE("name");