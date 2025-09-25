CREATE TYPE "public"."role" AS ENUM('user', 'admin', 'receptionist');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" "role" DEFAULT 'user' NOT NULL,
	"phone" text,
	"password_changed_at" timestamp,
	"password_reset_token" text,
	"password_reset_expires" timestamp,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "seats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seat_number" text NOT NULL,
	"hall" serial NOT NULL,
	"booked" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "halls" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"rows" integer NOT NULL,
	"columns" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"release_date" timestamp NOT NULL,
	"description" text,
	"poster_url" text
);
--> statement-breakpoint
ALTER TABLE "seats" ADD CONSTRAINT "seats_hall_halls_id_fk" FOREIGN KEY ("hall") REFERENCES "public"."halls"("id") ON DELETE cascade ON UPDATE cascade;