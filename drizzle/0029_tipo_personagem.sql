CREATE TYPE "public"."tipo_personagem" AS ENUM('jogador', 'nao_jogador');--> statement-breakpoint
ALTER TABLE "personagem" ADD COLUMN "tipo" "tipo_personagem" DEFAULT 'nao_jogador' NOT NULL;--> statement-breakpoint
UPDATE "personagem"
SET "tipo" = 'jogador'
WHERE NULLIF(BTRIM("jogador_nome"), '') IS NOT NULL
   OR EXISTS (
     SELECT 1 FROM "user"
     WHERE "user"."id" = "personagem"."dono_id"
       AND "user"."papel" = 'jogador'
   );--> statement-breakpoint
UPDATE "personagem" SET "atribuido_a" = NULL WHERE "atribuido_a" IS NOT NULL;
