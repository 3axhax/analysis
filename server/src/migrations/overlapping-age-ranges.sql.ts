export const OVERLAPPING_AGE_RANGES_SQL = `
CREATE TABLE "medicalSourceAge" (
  "sourceId" integer NOT NULL REFERENCES "medicalSource"(id) ON DELETE CASCADE,
  "ageId" integer NOT NULL REFERENCES ages(id) ON DELETE RESTRICT,
  PRIMARY KEY ("sourceId", "ageId")
);
CREATE INDEX medical_source_age_age_idx ON "medicalSourceAge" ("ageId");

DO $$
DECLARE
  source record;
  age_key integer;
  lower_day integer;
  upper_day integer;
  first_day integer;
  last_day integer;
BEGIN
  SELECT min("intervalDayStart"), max("intervalDayEnd") INTO STRICT first_day, last_day FROM ages;
  FOR source IN SELECT id, metadata FROM "medicalSource"
    WHERE metadata ?| ARRAY['allowedAgeIds', 'minAgeDays', 'maxAgeDays']
  LOOP
    IF source.metadata ? 'allowedAgeIds' THEN
      IF source.metadata ?| ARRAY['minAgeDays','maxAgeDays']
        OR jsonb_typeof(source.metadata->'allowedAgeIds') IS DISTINCT FROM 'array'
      THEN
        RAISE EXCEPTION 'Invalid age scope for source %', source.id;
      END IF;
      INSERT INTO "medicalSourceAge" ("sourceId", "ageId")
      SELECT DISTINCT source.id, value::integer
      FROM jsonb_array_elements_text(source.metadata->'allowedAgeIds');
      IF NOT FOUND THEN RAISE EXCEPTION 'Empty age scope for source %', source.id; END IF;
      CONTINUE;
    END IF;

    lower_day := coalesce((source.metadata->>'minAgeDays')::integer, first_day);
    upper_day := coalesce((source.metadata->>'maxAgeDays')::integer, last_day);
    IF lower_day < first_day OR upper_day > last_day OR lower_day > upper_day THEN
      RAISE EXCEPTION 'Invalid age bounds for source %', source.id;
    END IF;

    SELECT id INTO age_key FROM ages
    WHERE "intervalDayStart" = lower_day AND "intervalDayEnd" = upper_day
    ORDER BY id LIMIT 1;
    IF age_key IS NULL THEN
      INSERT INTO ages (name, "intervalDayStart", "intervalDayEnd")
      VALUES ('days-' || lower_day || '-' || upper_day, lower_day, upper_day)
      RETURNING id INTO age_key;
    END IF;
    INSERT INTO "medicalSourceAge" ("sourceId", "ageId") VALUES (source.id, age_key);
  END LOOP;
END $$;

-- The dated sources were expanded over the intersecting base ages. Fold only identical copies.
CREATE TEMP TABLE age_interval_remap ON COMMIT DROP AS
SELECT i.id AS old_id, scope."ageId" AS target_age,
       min(i.id) OVER same_interval AS keep_id
FROM "analysisPointIntervalValue" i
JOIN "medicalSource" s ON s.id=i."sourceId" AND s.metadata ?| ARRAY['minAgeDays','maxAgeDays']
JOIN "medicalSourceAge" scope ON scope."sourceId"=s.id
WINDOW same_interval AS (
  PARTITION BY i."sourceId", i."pointId", i."genderId", i."unitId",
    i."minValue", i."maxValue", i."minValueEqual", i."maxValueEqual", i.status
);
CREATE UNIQUE INDEX ON age_interval_remap (old_id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM age_interval_remap m
    JOIN "analysisPointIntervalValue" i ON i.id=m.old_id
    JOIN ages original ON original.id=i."ageId"
    JOIN ages target ON target.id=m.target_age
    GROUP BY m.keep_id, target."intervalDayStart", target."intervalDayEnd"
    HAVING NOT int8range(target."intervalDayStart", target."intervalDayEnd", '[]')
      <@ range_agg(int8range(original."intervalDayStart", original."intervalDayEnd", '[]'))
  ) THEN
    RAISE EXCEPTION 'Existing source intervals do not cover the full migrated age range';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM "analysisResultIntervalDescriptionCondition" l
    JOIN age_interval_remap m ON m.old_id=l."intervalId"
    JOIN ages target ON target.id=m.target_age
    JOIN "analysisPointIntervalValue" i ON i.id=m.old_id
    JOIN ages original ON original.id=i."ageId"
    GROUP BY l."conditionId", m.keep_id, target."intervalDayStart", target."intervalDayEnd"
    HAVING NOT int8range(target."intervalDayStart", target."intervalDayEnd", '[]')
      <@ range_agg(int8range(original."intervalDayStart", original."intervalDayEnd", '[]'))
  ) THEN
    RAISE EXCEPTION 'A description condition covers only part of its migrated age range';
  END IF;
END $$;

INSERT INTO "analysisResultIntervalDescriptionCondition" ("conditionId", "intervalId", "pointId")
SELECT DISTINCT l."conditionId", m.keep_id, l."pointId"
FROM "analysisResultIntervalDescriptionCondition" l
JOIN age_interval_remap m ON m.old_id=l."intervalId"
WHERE m.old_id <> m.keep_id
ON CONFLICT DO NOTHING;

DELETE FROM "analysisResultIntervalDescriptionCondition" l
USING age_interval_remap m WHERE l."intervalId"=m.old_id AND m.old_id <> m.keep_id;
DELETE FROM "analysisPointIntervalValue" i
USING age_interval_remap m WHERE i.id=m.old_id AND m.old_id <> m.keep_id;
UPDATE "analysisPointIntervalValue" i
SET "ageId"=m.target_age FROM age_interval_remap m
WHERE i.id=m.keep_id AND m.old_id=m.keep_id AND i."ageId"<>m.target_age;

UPDATE "medicalSource"
SET metadata=metadata - ARRAY['allowedAgeIds','minAgeDays','maxAgeDays']
WHERE metadata ?| ARRAY['allowedAgeIds','minAgeDays','maxAgeDays'];

ALTER TABLE "analysisResult" DROP COLUMN "ageId";
`;
