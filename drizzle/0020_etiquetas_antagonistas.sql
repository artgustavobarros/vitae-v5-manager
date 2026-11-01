ALTER TABLE "modelo_antagonista" ALTER COLUMN "categoria" SET DEFAULT 'Outros';--> statement-breakpoint
ALTER TABLE "modelo_antagonista" ADD COLUMN "etiquetas" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
UPDATE "modelo_antagonista"
SET "etiquetas" = "etiquetas" || jsonb_build_array(trim("categoria")), "categoria" = 'Carniçal'
WHERE lower(trim("categoria")) IN ('ataque', 'geral')
  AND (lower("nome") LIKE '%carniçal%' OR "id" IN ('953a9534-2483-4ee7-b5d6-4578a672ee2b', '98f62397-9c7a-4586-a663-da6246a646df'));--> statement-breakpoint
UPDATE "modelo_antagonista"
SET "etiquetas" = "etiquetas" || to_jsonb((regexp_split_to_array("categoria", '\s*·\s*'))[2:]),
    "categoria" = trim(split_part("categoria", '·', 1))
WHERE "categoria" LIKE '%·%';--> statement-breakpoint
UPDATE "modelo_antagonista"
SET "categoria" = CASE lower(trim("categoria"))
    WHEN 'animal' THEN 'Animal'
    WHEN 'carniçal' THEN 'Carniçal'
    WHEN 'criatura sobrenatural' THEN 'Criatura sobrenatural'
    WHEN 'lobisomem' THEN 'Lobisomem'
    WHEN 'mortal' THEN 'Mortal'
    WHEN 'vampiro' THEN 'Vampiro'
    WHEN 'outros' THEN 'Outros'
    ELSE 'Outros'
  END,
  "etiquetas" = "etiquetas" || CASE
    WHEN lower(trim("categoria")) NOT IN ('animal', 'carniçal', 'criatura sobrenatural', 'lobisomem', 'mortal', 'vampiro', 'outros', 'geral', '')
    THEN jsonb_build_array(trim("categoria")) ELSE '[]'::jsonb END;--> statement-breakpoint
UPDATE "modelo_antagonista"
SET "etiquetas" = "etiquetas" || '["Sabá"]'::jsonb
WHERE "id" = '19e21a6a-0f97-5b30-ba54-6f48aed6f8b5'
  AND NOT ("etiquetas" @> '["Sabá"]'::jsonb);
