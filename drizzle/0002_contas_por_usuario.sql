ALTER TABLE "convite_cronica" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "convite_cronica" CASCADE;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "display_username" text;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username");