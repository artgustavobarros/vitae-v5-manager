CREATE TABLE "parada_compartilhada" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"atributo" text NOT NULL,
	"habilidade" text NOT NULL,
	"criado_por_id" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "preferencia_paradas" (
	"usuario_id" text PRIMARY KEY NOT NULL,
	"ordem" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "parada_compartilhada" ADD CONSTRAINT "parada_compartilhada_criado_por_id_user_id_fk" FOREIGN KEY ("criado_por_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preferencia_paradas" ADD CONSTRAINT "preferencia_paradas_usuario_id_user_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "parada_compartilhada_criado_por_id_idx" ON "parada_compartilhada" USING btree ("criado_por_id");--> statement-breakpoint
-- Preserva as definições anteriores, mantendo seus ids usados na ordem salva.
INSERT INTO "parada_compartilhada" ("id", "nome", "atributo", "habilidade", "criado_por_id", "criado_em", "atualizado_em")
SELECT DISTINCT ON ((entrada->>'id')::uuid)
  (entrada->>'id')::uuid, entrada->>'nome', entrada->>'atributo', entrada->>'habilidade',
  p."dono_id", p."criado_em", p."atualizado_em"
FROM "personagem" p
CROSS JOIN LATERAL jsonb_array_elements(p."paradas_personalizadas") AS entrada
ORDER BY (entrada->>'id')::uuid, p."atualizado_em" DESC, p."id";
--> statement-breakpoint
-- Se houver mais de uma ordem por dono, preserva a do Personagem atualizado mais recentemente.
INSERT INTO "preferencia_paradas" ("usuario_id", "ordem")
SELECT DISTINCT ON ("dono_id") "dono_id", "ordem_paradas"
FROM "personagem"
WHERE jsonb_array_length("ordem_paradas") > 0
ORDER BY "dono_id", "atualizado_em" DESC, "id";
--> statement-breakpoint
ALTER TABLE "personagem" DROP COLUMN "paradas_personalizadas";--> statement-breakpoint
ALTER TABLE "personagem" DROP COLUMN "ordem_paradas";