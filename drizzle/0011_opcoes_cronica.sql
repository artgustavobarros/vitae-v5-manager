CREATE TABLE "cronica" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text DEFAULT 'Crônica' NOT NULL,
	"opcoes_criacao" jsonb DEFAULT '{"idadePadrao":"neofito","sangueRaloPermitido":false,"caitiffPermitido":true,"clasPermitidos":["banu-haqim","brujah","gangrel","hecata","lasombra","malkaviano","ministerio","nosferatu","ravnos","salubri","toreador","tremere","tzimisce","ventrue"]}'::jsonb NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
