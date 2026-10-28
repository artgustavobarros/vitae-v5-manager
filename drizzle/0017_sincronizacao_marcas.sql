CREATE TABLE "operacao_marcacao" (
	"usuario_id" text NOT NULL,
	"operacao_id" uuid NOT NULL,
	"personagem_id" uuid NOT NULL,
	"entrada" jsonb NOT NULL,
	"resultado" jsonb NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "operacao_marcacao_usuario_id_operacao_id_pk" PRIMARY KEY("usuario_id","operacao_id")
);
--> statement-breakpoint
ALTER TABLE "personagem" ADD COLUMN "revisao_marcas" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "operacao_marcacao" ADD CONSTRAINT "operacao_marcacao_usuario_id_user_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operacao_marcacao" ADD CONSTRAINT "operacao_marcacao_personagem_id_personagem_id_fk" FOREIGN KEY ("personagem_id") REFERENCES "public"."personagem"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE FUNCTION "incrementar_revisao_marcas"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.ficha IS DISTINCT FROM OLD.ficha THEN
    NEW.revisao_marcas := OLD.revisao_marcas + 1;
  ELSE
    NEW.revisao_marcas := OLD.revisao_marcas;
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "personagem_revisao_marcas" BEFORE UPDATE ON "personagem"
FOR EACH ROW EXECUTE FUNCTION "incrementar_revisao_marcas"();
