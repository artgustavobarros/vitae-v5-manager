CREATE TABLE "link_publico" (
	"id" text PRIMARY KEY NOT NULL,
	"token_hash" text,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
