CREATE TYPE "public"."status_revisao" AS ENUM('aprovado', 'sugerido');--> statement-breakpoint
CREATE TABLE "revisao_traducao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" text NOT NULL,
	"status" "status_revisao" NOT NULL,
	"sugestao_nome" text,
	"sugestao_descricao" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "coterie" ADD COLUMN "tipo" text;--> statement-breakpoint
ALTER TABLE "coterie" ADD COLUMN "vantagens" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "coterie" ADD COLUMN "defeitos" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
CREATE INDEX "revisao_traducao_item_id_idx" ON "revisao_traducao" USING btree ("item_id");--> statement-breakpoint
-- Fichas antigas ganham as listas do Catálogo vazias; chaves que já existem ficam como estão.
UPDATE "personagem" SET "ficha" = '{"poderes":[],"rituais":[],"cerimonias":[],"formulas":[],"vantagens":[],"defeitos":[]}'::jsonb || "ficha";
