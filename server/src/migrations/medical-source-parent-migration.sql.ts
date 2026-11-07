export const MEDICAL_SOURCE_PARENT_SQL = `
ALTER TABLE "medicalSource" RENAME COLUMN "parentId" TO parent_id;
CREATE OR REPLACE FUNCTION medical_source_check_cycle() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.parent_id IS DISTINCT FROM OLD.parent_id THEN
    RAISE EXCEPTION 'medical source reparenting is not supported';
  END IF;
  PERFORM pg_advisory_xact_lock(28002001);
  IF NEW.parent_id IS NOT NULL AND EXISTS (
    WITH RECURSIVE ancestors(id, parent_id) AS (
      SELECT id, parent_id FROM "medicalSource" WHERE id = NEW.parent_id
      UNION
      SELECT s.id, s.parent_id FROM "medicalSource" s JOIN ancestors a ON s.id = a.parent_id
    ) SELECT 1 FROM ancestors WHERE id = NEW.id
  ) THEN RAISE EXCEPTION 'medical source cycle'; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
`;
