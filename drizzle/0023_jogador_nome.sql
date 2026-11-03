ALTER TABLE "personagem" ADD COLUMN "jogador_nome" text;

UPDATE "personagem" SET "jogador_nome" = 'Geovane' WHERE "nome" = 'Geovane' AND "jogador_nome" IS NULL;
UPDATE "personagem" SET "jogador_nome" = 'Rodolfo' WHERE "nome" = 'Rodolfo' AND "jogador_nome" IS NULL;
UPDATE "personagem" SET "jogador_nome" = 'João' WHERE "nome" = 'João' AND "jogador_nome" IS NULL;
UPDATE "personagem" SET "jogador_nome" = 'Isadora' WHERE "nome" = 'Isadora' AND "jogador_nome" IS NULL;
