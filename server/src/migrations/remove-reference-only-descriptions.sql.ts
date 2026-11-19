export const REMOVE_REFERENCE_ONLY_DESCRIPTIONS_SQL = `
DO $$
DECLARE
  card_ids integer[];
BEGIN
  SELECT array_agg(d.id) INTO card_ids
  FROM "analysisResultDescription" d JOIN "medicalSource" s ON s.id=d."sourceId"
WHERE (s.metadata->>'doi', d.description_ru) IN (
 ('10.1016/j.htct.2026.108552', 'Отношение нейтрофилов к лимфоцитам ниже референса ELSA-Brasil.'),
 ('10.1016/j.htct.2026.108552', 'Отношение нейтрофилов к лимфоцитам выше референса ELSA-Brasil.'),
 ('10.1186/s12865-025-00797-2', 'Отношение нейтрофилов к лимфоцитам ниже возрастного референса исследования в Цзыгуне.'),
 ('10.1186/s12865-025-00797-2', 'Отношение нейтрофилов к лимфоцитам выше возрастного референса исследования в Цзыгуне.'),
 ('10.3390/jcm9030792', 'ТТГ выше возрастной верхней границы по данным исследования в Лионе.')
);

  IF card_ids IS NULL THEN
    RETURN;
  END IF;
  IF cardinality(card_ids) <> 16 OR EXISTS (
    SELECT 1 FROM "analysisResultDescription" WHERE "alternativeToId" = ANY(card_ids)
  ) THEN
    RAISE EXCEPTION 'Unexpected set of reference-only descriptions';
  END IF;

  DELETE FROM "analysisResultDescriptionCondition" WHERE "descriptionId" = ANY(card_ids);
  DELETE FROM "analysisResultDescription" WHERE id = ANY(card_ids);
END $$;
`;
