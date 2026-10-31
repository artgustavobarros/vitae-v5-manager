ALTER TABLE "modelo_antagonista" ALTER COLUMN "parada_fisico" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "modelo_antagonista" ALTER COLUMN "parada_social" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "modelo_antagonista" ALTER COLUMN "parada_mental" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "modelo_antagonista" ADD COLUMN "ficha_completa" jsonb;