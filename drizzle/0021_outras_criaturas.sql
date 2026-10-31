WITH criaturas AS (
  SELECT id, CASE
    WHEN categoria = 'Lobisomem' THEN 'Lobisomem'
    WHEN id = '5897aa61-9526-5b5d-ad4e-83a260d0e006' OR lower(trim(nome)) = 'fada' THEN 'Fada'
    WHEN id = '54bc13f5-774f-5a0d-a7c9-16af92bdedc3' OR lower(trim(nome)) = 'mago' THEN 'Mago'
    WHEN id = '4f269a23-af61-5826-9b94-580b749ca282' OR lower(trim(nome)) = 'espectro' THEN 'Espectro'
    ELSE NULL END AS etiqueta
  FROM modelo_antagonista
  WHERE categoria IN ('Criatura sobrenatural', 'Lobisomem')
)
UPDATE modelo_antagonista AS modelo
SET categoria = 'Outras criaturas',
    etiquetas = CASE WHEN criaturas.etiqueta IS NULL OR EXISTS (
      SELECT 1 FROM jsonb_array_elements_text(modelo.etiquetas) AS existente(valor)
      WHERE lower(trim(existente.valor)) = lower(criaturas.etiqueta)
    ) THEN modelo.etiquetas ELSE modelo.etiquetas || jsonb_build_array(criaturas.etiqueta) END
FROM criaturas
WHERE modelo.id = criaturas.id;
