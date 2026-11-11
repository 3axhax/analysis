export const DESCRIPTION_WORDING_REMAINING_SQL = String.raw`
DO $$
DECLARE spec record; affected integer; total integer := 0;
BEGIN
 LOCK TABLE "analysisResultDescription" IN SHARE ROW EXCLUSIVE MODE;
 FOR spec IN SELECT expected_md5, new_text, count(*) AS expected_count FROM (VALUES
  ('c0220d326e8f096500c7afe50487e687','Синдром Жильбера.'),
  ('5232b70e94100267da23c3b3608aa805','Синдром Жильбера. Дополнительное подтверждение — анализ на наследственную гипербилирубинемию.'),
  ('6ff97d6757c055843750d00fc0c22985','Дефицит железа без анемии.'),
  ('5885809eb9af239c1d784567719dafc2','Дефицит железа.'),
  ('35bb0fd5337d20c10bef69cc77ede16e','В12- и фолиево-дефицитная анемия.'),
  ('5232b70e94100267da23c3b3608aa805','Синдром Жильбера. Дополнительное подтверждение — анализ на наследственную гипербилирубинемию.'),
  ('5232b70e94100267da23c3b3608aa805','Синдром Жильбера. Дополнительное подтверждение — анализ на наследственную гипербилирубинемию.'),
  ('5232b70e94100267da23c3b3608aa805','Синдром Жильбера. Дополнительное подтверждение — анализ на наследственную гипербилирубинемию.'),
  ('5357303bb3eedf890d6e0937e938d85a','Дефицит белка; искать причины, посмотреть глобулины.'),
  ('2ced4aabcc393bc7a8f715ab5292e245','Избыток аммиака, нарушение работы почек при повышенном креатинине.'),
  ('d01ef03e047b8a4354ef69802c253285','Низкий окислительный статус, особенно при низком билирубине.')
 ) AS changes(expected_md5, new_text) GROUP BY expected_md5, new_text LOOP
  UPDATE "analysisResultDescription" SET description_ru=spec.new_text, "updatedAt"=now() WHERE md5(description_ru)=spec.expected_md5;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> spec.expected_count THEN RAISE EXCEPTION 'Description group changed or missing'; END IF;
  total := total + affected;
 END LOOP;
 IF total <> 11 THEN RAISE EXCEPTION 'Unexpected description count'; END IF;
END $$;
`;
