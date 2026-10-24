CREATE TABLE "convite_coterie" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coterie_id" uuid NOT NULL,
	"personagem_id" uuid NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coterie" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"conceito" text,
	"caca" integer DEFAULT 0 NOT NULL,
	"abrigo" integer DEFAULT 0 NOT NULL,
	"porte" integer DEFAULT 0 NOT NULL,
	"eh_padrao" boolean DEFAULT false NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "membro_coterie" (
	"coterie_id" uuid NOT NULL,
	"personagem_id" uuid NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "membro_coterie_coterie_id_personagem_id_pk" PRIMARY KEY("coterie_id","personagem_id")
);
--> statement-breakpoint
CREATE TABLE "notificacao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" text NOT NULL,
	"texto" text NOT NULL,
	"link_json" jsonb,
	"lida" boolean DEFAULT false NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "personagem" ADD COLUMN "compartilha_condicao" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "personagem" ADD COLUMN "fixado" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "convite_coterie" ADD CONSTRAINT "convite_coterie_coterie_id_coterie_id_fk" FOREIGN KEY ("coterie_id") REFERENCES "public"."coterie"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convite_coterie" ADD CONSTRAINT "convite_coterie_personagem_id_personagem_id_fk" FOREIGN KEY ("personagem_id") REFERENCES "public"."personagem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membro_coterie" ADD CONSTRAINT "membro_coterie_coterie_id_coterie_id_fk" FOREIGN KEY ("coterie_id") REFERENCES "public"."coterie"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membro_coterie" ADD CONSTRAINT "membro_coterie_personagem_id_personagem_id_fk" FOREIGN KEY ("personagem_id") REFERENCES "public"."personagem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notificacao" ADD CONSTRAINT "notificacao_usuario_id_user_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "convite_coterie_coterie_id_idx" ON "convite_coterie" USING btree ("coterie_id");--> statement-breakpoint
CREATE INDEX "convite_coterie_personagem_id_idx" ON "convite_coterie" USING btree ("personagem_id");--> statement-breakpoint
CREATE INDEX "membro_coterie_personagem_id_idx" ON "membro_coterie" USING btree ("personagem_id");--> statement-breakpoint
CREATE INDEX "notificacao_usuario_id_idx" ON "notificacao" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX "notificacao_criado_em_idx" ON "notificacao" USING btree ("criado_em");--> statement-breakpoint
INSERT INTO "coterie" ("nome", "conceito", "caca", "abrigo", "porte", "eh_padrao")
SELECT 'Coterie Padrão', 'A Coterie principal da Crônica.', 0, 0, 0, true
WHERE NOT EXISTS (SELECT 1 FROM "coterie" WHERE "eh_padrao" = true);
