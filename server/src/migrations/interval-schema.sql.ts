/** Prepared transition; register only once all readers and writers migrate. */
export const INTERVAL_SCHEMA_SQL = `
CREATE TABLE "analysisPointIntervalValue" (
  id SERIAL PRIMARY KEY,
  "sourceId" INTEGER REFERENCES "medicalSource"(id) ON DELETE RESTRICT,
  "pointId" INTEGER NOT NULL REFERENCES "analysisPoint"(id) ON DELETE RESTRICT,
  "ageId" INTEGER NOT NULL REFERENCES ages(id) ON DELETE RESTRICT,
  "genderId" INTEGER NOT NULL REFERENCES gender(id) ON DELETE RESTRICT,
  "unitId" INTEGER NOT NULL REFERENCES "analysisPointUnits"(id) ON DELETE RESTRICT,
  "minValue" NUMERIC,
  "maxValue" NUMERIC,
  "minValueEqual" BOOLEAN,
  "maxValueEqual" BOOLEAN,
  status VARCHAR(16) CHECK (status IN ('LOW','NORMAL','HIGH','OPTIMUM')),
  CONSTRAINT interval_at_least_one_bound CHECK ("minValue" IS NOT NULL OR "maxValue" IS NOT NULL),
  CONSTRAINT interval_min_flag CHECK (("minValue" IS NULL) = ("minValueEqual" IS NULL)),
  CONSTRAINT interval_max_flag CHECK (("maxValue" IS NULL) = ("maxValueEqual" IS NULL)),
  CONSTRAINT interval_finite CHECK (("minValue" IS NULL OR "minValue"::text NOT IN ('NaN','Infinity','-Infinity')) AND ("maxValue" IS NULL OR "maxValue"::text NOT IN ('NaN','Infinity','-Infinity'))),
  CONSTRAINT interval_precision CHECK (("minValue" IS NULL OR (abs("minValue") < 1e20 AND scale(trim_scale("minValue")) <= 18)) AND ("maxValue" IS NULL OR (abs("maxValue") < 1e20 AND scale(trim_scale("maxValue")) <= 18))),
  CONSTRAINT interval_nonempty CHECK ("minValue" IS NULL OR "maxValue" IS NULL OR "minValue" < "maxValue" OR ("minValue" = "maxValue" AND "minValueEqual" AND "maxValueEqual")),
  UNIQUE (id, "pointId")
);
CREATE INDEX interval_context_idx ON "analysisPointIntervalValue" ("pointId", "ageId", "genderId", "unitId");
-- New conditions have links instead of a status; legacy rows retain their value until cutover.
ALTER TABLE "analysisResultDescriptionCondition" ALTER COLUMN status DROP NOT NULL;
ALTER TABLE "analysisResultDescriptionCondition" ADD CONSTRAINT description_condition_id_point_unique UNIQUE (id, "pointId");
CREATE TABLE "analysisResultIntervalDescriptionCondition" (
  "conditionId" INTEGER NOT NULL,
  "intervalId" INTEGER NOT NULL,
  "pointId" INTEGER NOT NULL,
  PRIMARY KEY ("conditionId", "intervalId"),
  FOREIGN KEY ("conditionId", "pointId") REFERENCES "analysisResultDescriptionCondition"(id, "pointId") ON DELETE CASCADE,
  FOREIGN KEY ("intervalId", "pointId") REFERENCES "analysisPointIntervalValue"(id, "pointId") ON DELETE RESTRICT
);
CREATE INDEX interval_condition_interval_idx ON "analysisResultIntervalDescriptionCondition" ("intervalId");
`;
