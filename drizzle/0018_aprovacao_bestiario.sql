CREATE TYPE "public"."status_revisao_bestiario" AS ENUM('pendente', 'aprovado', 'corrigir', 'rejeitado');--> statement-breakpoint
ALTER TABLE "modelo_antagonista" ADD COLUMN "status_revisao" "status_revisao_bestiario" DEFAULT 'pendente' NOT NULL;--> statement-breakpoint
ALTER TABLE "modelo_antagonista" ADD COLUMN "nota_revisao" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "modelo_antagonista" ADD COLUMN "incluido" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
UPDATE "modelo_antagonista" SET "nome" = 'Investigador da Inquisição'
WHERE "id" = 'bb50b2c8-add5-57ee-90b3-1e49ce18fad2' AND "nome" = 'Inquisidor investigador';
