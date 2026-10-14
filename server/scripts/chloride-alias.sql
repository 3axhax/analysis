-- psql data migration: dry-run by default; -v apply=true to commit.
-- Reverse with -v apply=true -v reverse=true; exact state precondition.
\if :{?apply}
\else
\set apply false
\endif
\if :{?reverse}
\else
\set reverse false
\endif
BEGIN;
CREATE TEMP TABLE chloride_alias_change (old_value text, new_value text) ON COMMIT DROP;
INSERT INTO chloride_alias_change VALUES ('Cl_хлориды', 'Cl_хлориды_Хлор');
\if :reverse
UPDATE chloride_alias_change SET old_value = new_value, new_value = old_value;
\endif
LOCK TABLE "analysisPoint" IN SHARE ROW EXCLUSIVE MODE;
DO $$ BEGIN
IF (SELECT count(*) FROM "analysisPoint" WHERE name = 'cl') <> 1
OR EXISTS (SELECT 1 FROM "analysisPoint", chloride_alias_change WHERE name = 'cl' AND "translationParsing" IS DISTINCT FROM old_value)
THEN RAISE EXCEPTION 'Catalog precondition failed; no changes applied'; END IF;
END $$;
UPDATE "analysisPoint" SET "translationParsing" = new_value FROM chloride_alias_change WHERE name = 'cl';
SELECT count(*) AS verified_rows FROM "analysisPoint", chloride_alias_change WHERE name = 'cl' AND "translationParsing" = new_value;
\if :apply
COMMIT;
\else
ROLLBACK;
\endif
