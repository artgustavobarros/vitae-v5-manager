CREATE TABLE "combate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rodada" integer DEFAULT 1 NOT NULL,
	"turno_atual" integer DEFAULT 0 NOT NULL,
	"participantes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modelo_antagonista" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"parada_fisico" integer DEFAULT 1 NOT NULL,
	"parada_social" integer DEFAULT 1 NOT NULL,
	"parada_mental" integer DEFAULT 1 NOT NULL,
	"vitalidade" integer DEFAULT 3 NOT NULL,
	"vontade" integer DEFAULT 3 NOT NULL,
	"paradas_excepcionais" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"especiais" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notas" text DEFAULT '' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "personagem" ADD COLUMN "ressonancia_atual" jsonb;--> statement-breakpoint
ALTER TABLE "personagem" ADD COLUMN "compulsao_ativa" jsonb;