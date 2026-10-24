ALTER TABLE "convite_cronica" ADD COLUMN "substituido_em" timestamp with time zone;--> statement-breakpoint
-- Os links antigos eram de uso único, um por pessoa: nenhum deles vira o link da mesa.
UPDATE "convite_cronica" SET "substituido_em" = now();
