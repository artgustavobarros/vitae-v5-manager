-- Seita deixa de ser texto livre: só camarilla, saba ou anarquistas; o resto vira null.
UPDATE "personagem"
SET "ficha" = jsonb_set(
  "ficha",
  '{seita}',
  CASE lower(trim("ficha"->>'seita'))
    WHEN 'camarilla' THEN '"camarilla"'::jsonb
    WHEN 'sabá' THEN '"saba"'::jsonb
    WHEN 'saba' THEN '"saba"'::jsonb
    WHEN 'anarquistas' THEN '"anarquistas"'::jsonb
    WHEN 'anarquista' THEN '"anarquistas"'::jsonb
    ELSE 'null'::jsonb
  END
);
