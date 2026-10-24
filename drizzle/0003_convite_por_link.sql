CREATE TABLE "convite_cronica" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"usado_em" timestamp with time zone,
	"usado_por" text,
	CONSTRAINT "convite_cronica_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "convite_cronica" ADD CONSTRAINT "convite_cronica_usado_por_user_id_fk" FOREIGN KEY ("usado_por") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;