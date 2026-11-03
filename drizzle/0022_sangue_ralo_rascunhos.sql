DO $$
DECLARE
  v_narrador_id text;
  v_ficha jsonb;
BEGIN
  SELECT id INTO v_narrador_id
  FROM "user"
  ORDER BY CASE WHEN papel = 'narrador' THEN 0 ELSE 1 END, created_at ASC
  LIMIT 1;

  IF v_narrador_id IS NOT NULL THEN
    v_ficha := '{"conceito":"","cla":"sangue-ralo","geracao":14,"seita":null,"senhor":"","tipoPredador":null,"ambicao":"","desejo":"","conviccoes":[],"aparencia":"","historia":"","atributos":{"forca":1,"destreza":1,"vigor":1,"carisma":1,"manipulacao":1,"autocontrole":1,"inteligencia":1,"raciocinio":1,"determinacao":1},"habilidades":{"armas-brancas":{"valor":0,"especializacoes":[]},"armas-de-fogo":{"valor":0,"especializacoes":[]},"atletismo":{"valor":0,"especializacoes":[]},"briga":{"valor":0,"especializacoes":[]},"conducao":{"valor":0,"especializacoes":[]},"furtividade":{"valor":0,"especializacoes":[]},"ladroagem":{"valor":0,"especializacoes":[]},"oficios":{"valor":0,"especializacoes":[]},"sobrevivencia":{"valor":0,"especializacoes":[]},"etiqueta":{"valor":0,"especializacoes":[]},"etiqueta-com-animais":{"valor":0,"especializacoes":[]},"intimidacao":{"valor":0,"especializacoes":[]},"lideranca":{"valor":0,"especializacoes":[]},"manha":{"valor":0,"especializacoes":[]},"performance":{"valor":0,"especializacoes":[]},"persuasao":{"valor":0,"especializacoes":[]},"sagacidade":{"valor":0,"especializacoes":[]},"subterfugio":{"valor":0,"especializacoes":[]},"ciencia":{"valor":0,"especializacoes":[]},"erudicao":{"valor":0,"especializacoes":[]},"financas":{"valor":0,"especializacoes":[]},"investigacao":{"valor":0,"especializacoes":[]},"medicina":{"valor":0,"especializacoes":[]},"ocultismo":{"valor":0,"especializacoes":[]},"percepcao":{"valor":0,"especializacoes":[]},"politica":{"valor":0,"especializacoes":[]},"tecnologia":{"valor":0,"especializacoes":[]}},"disciplinas":[],"poderes":[],"rituais":[],"cerimonias":[],"formulas":[],"vantagens":[],"defeitos":[],"potenciaSangue":0,"humanidade":7,"manchas":0,"fome":1,"danoVitalidade":{"superficial":0,"agravado":0},"danoVontade":{"superficial":0,"agravado":0}}'::jsonb;

    IF NOT EXISTS (SELECT 1 FROM personagem WHERE nome = 'Geovane' AND dono_id = v_narrador_id) THEN
      INSERT INTO personagem (id, dono_id, status, nome, ficha)
      VALUES (gen_random_uuid(), v_narrador_id, 'ativo', 'Geovane', v_ficha);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM personagem WHERE nome = 'Rodolfo' AND dono_id = v_narrador_id) THEN
      INSERT INTO personagem (id, dono_id, status, nome, ficha)
      VALUES (gen_random_uuid(), v_narrador_id, 'ativo', 'Rodolfo', v_ficha);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM personagem WHERE nome = 'João' AND dono_id = v_narrador_id) THEN
      INSERT INTO personagem (id, dono_id, status, nome, ficha)
      VALUES (gen_random_uuid(), v_narrador_id, 'ativo', 'João', v_ficha);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM personagem WHERE nome = 'Isadora' AND dono_id = v_narrador_id) THEN
      INSERT INTO personagem (id, dono_id, status, nome, ficha)
      VALUES (gen_random_uuid(), v_narrador_id, 'ativo', 'Isadora', v_ficha);
    END IF;
  END IF;
END $$;
