ALTER TABLE "showtimes" RENAME COLUMN "movie_id" TO "movies";--> statement-breakpoint
ALTER TABLE "showtimes" RENAME COLUMN "hall_id" TO "halls";--> statement-breakpoint
ALTER TABLE "showtimes" DROP CONSTRAINT "showtimes_movie_id_movies_id_fk";
--> statement-breakpoint
ALTER TABLE "showtimes" DROP CONSTRAINT "showtimes_hall_id_halls_id_fk";
--> statement-breakpoint
ALTER TABLE "showtimes" ADD CONSTRAINT "showtimes_movies_movies_id_fk" FOREIGN KEY ("movies") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "showtimes" ADD CONSTRAINT "showtimes_halls_halls_id_fk" FOREIGN KEY ("halls") REFERENCES "public"."halls"("id") ON DELETE cascade ON UPDATE cascade;