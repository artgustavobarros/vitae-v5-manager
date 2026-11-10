CREATE TABLE "relogio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"tipo" text NOT NULL,
	"descricao" text DEFAULT '' NOT NULL,
	"total" integer NOT NULL,
	"atual" integer NOT NULL,
	"perigo" text NOT NULL,
	"visivel" boolean DEFAULT true NOT NULL,
	"efeitos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"revisao" integer DEFAULT 1 NOT NULL,
	"ultima_tendencia" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
