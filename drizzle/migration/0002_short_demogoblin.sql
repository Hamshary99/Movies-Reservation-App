ALTER TABLE "seats" ALTER COLUMN "seat_number" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "seats" ADD COLUMN "is_available" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "halls" DROP COLUMN "rows";--> statement-breakpoint
ALTER TABLE "halls" DROP COLUMN "columns";