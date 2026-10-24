ALTER TABLE "convite_cronica" DROP CONSTRAINT "convite_cronica_usado_por_user_id_fk";
--> statement-breakpoint
ALTER TABLE "convite_cronica" DROP COLUMN "usado_em";--> statement-breakpoint
ALTER TABLE "convite_cronica" DROP COLUMN "usado_por";