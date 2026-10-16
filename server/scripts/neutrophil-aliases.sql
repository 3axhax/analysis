-- Explicit psql data migration. Default is dry-run; apply with -v apply=true.
-- Roll back with -v reverse=true; unrelated catalog fields are untouched.
\if :{?apply}
\else
\set apply false
\endif
\if :{?reverse}
\else
\set reverse false
\endif
BEGIN;
CREATE TEMP TABLE neutrophil_alias_change (name text, old_value text, new_value text) ON COMMIT DROP;
INSERT INTO neutrophil_alias_change VALUES
('neutrophil-count', 'neus#_нейтрофилы_число нейтрофилов_NE', 'neus#_число нейтрофилов_NEU#_NE#_Количество нейтрофилов_Нейтрофилы, абс.'),
('neutrophil-percentage', 'neu%_Процентное соотношение нейтрофилов_Neutrophil percentage', 'neu%_Процентное соотношение нейтрофилов_Neutrophil percentage_NE%_Процент нейтрофилов_Нейтрофилы, %');
\if :reverse
UPDATE neutrophil_alias_change SET old_value = new_value, new_value = old_value;
\endif
LOCK TABLE "analysisPoint" IN SHARE ROW EXCLUSIVE MODE;
DO $$ BEGIN
IF (SELECT count(*) FROM "analysisPoint" p JOIN neutrophil_alias_change c ON p.name = c.name) <> 2
OR EXISTS (SELECT 1 FROM "analysisPoint" p JOIN neutrophil_alias_change c ON p.name = c.name WHERE p."translationParsing" IS DISTINCT FROM c.old_value)
THEN RAISE EXCEPTION 'Catalog precondition failed; no changes applied'; END IF;
END $$;
UPDATE "analysisPoint" p SET "translationParsing" = c.new_value FROM neutrophil_alias_change c WHERE p.name = c.name;
SELECT count(*) AS verified_rows FROM "analysisPoint" p JOIN neutrophil_alias_change c ON p.name = c.name AND p."translationParsing" = c.new_value;
\if :apply
COMMIT;
\else
ROLLBACK;
\endif
