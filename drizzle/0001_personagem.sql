CREATE TYPE "public"."status_personagem" AS ENUM('rascunho', 'ativo', 'arquivado');--> statement-breakpoint
CREATE TABLE "personagem" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dono_id" text NOT NULL,
	"status" "status_personagem" DEFAULT 'rascunho' NOT NULL,
	"nome" text DEFAULT '' NOT NULL,
	"ficha" jsonb NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "personagem" ADD CONSTRAINT "personagem_dono_id_user_id_fk" FOREIGN KEY ("dono_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "personagem_dono_id_idx" ON "personagem" USING btree ("dono_id");