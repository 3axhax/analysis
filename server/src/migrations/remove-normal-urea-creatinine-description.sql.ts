export const REMOVE_NORMAL_UREA_CREATININE_DESCRIPTION_SQL = `
DO $$
DECLARE
  target_id integer;
BEGIN
  target_id := (
    SELECT description.id
    FROM "analysisResultDescription" description
    JOIN "analysisResultDescriptionCondition" condition
      ON condition."descriptionId" = description.id
    JOIN "analysisPoint" point ON point.id = condition."pointId"
    WHERE description."sourceId" IS NULL
      AND description.description_ru IN (
        'При нормальной мочевине и креатинине симптомы, указывающие на возможное нарушение функции почек, требуют отдельной оценки специалистом. Эти результаты сами по себе не исключают заболевание.',
        'При признаках нарушения работы почек нужно проверить мочевину и креатинин в суточной моче. Определение клиренса по мочевине и креатинину используется для оценки функции почек.'
      )
    GROUP BY description.id
    HAVING array_agg(point.name::text ORDER BY point.name) = ARRAY['creatinine', 'urea']
      AND bool_and(
        EXISTS (
          SELECT 1
          FROM "analysisResultIntervalDescriptionCondition" link
          WHERE link."conditionId" = condition.id
        )
        AND NOT EXISTS (
          SELECT 1
          FROM "analysisResultIntervalDescriptionCondition" link
          JOIN "analysisPointIntervalValue" interval_value ON interval_value.id = link."intervalId"
          WHERE link."conditionId" = condition.id
            AND interval_value.status IS DISTINCT FROM 'NORMAL'
        )
      )
  );

  DELETE FROM "analysisResultDescriptionCondition" WHERE "descriptionId" = target_id;
  DELETE FROM "analysisResultDescription" WHERE id = target_id;
END $$;
`;
