UPDATE "modelo_antagonista"
SET "parada_fisico" = NULL,
    "parada_social" = NULL,
    "parada_mental" = NULL
WHERE "ficha_completa" IS NOT NULL;
