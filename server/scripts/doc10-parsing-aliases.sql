-- Explicit psql data migration. Default dry-run; -v apply=true to commit.
-- Reverse with -v apply=true -v reverse=true, subject to exact state checks.
\if :{?apply}
\else
\set apply false
\endif
\if :{?reverse}
\else
\set reverse false
\endif
BEGIN;
CREATE TEMP TABLE doc10_alias_change (id integer, name text, old_value text, added text, new_value text) ON COMMIT DROP;
INSERT INTO doc10_alias_change (id, name, old_value, added) VALUES
(4, 'albumin_fraction', 'альбуминовая фракция', 'Альбумин Albumin'),
(5, 'alpha-1_globulin_fraction', 'Alpha-1 globulins_Альфа-1 глобулины', 'Alpha 1 Альфа-1-глобулин'),
(17, 'lymphocyte-count', 'lym#_Число лимфоцитов_Lymphocyte count', 'Лимфоциты'),
(19, 'eosinophil-count', 'eos#_Число эозинофилов_Eosinophil count', 'Эозинофилы'),
(20, 'basophil-count', 'BASO#_basophil count_число базофилов_bas#', 'Базофилы'),
(58, 'alpha-2_globulins', 'a2_Alpha-2 globulins_Альфа-2 глобулины', 'Alpha 2 Альфа-2-глобулин'),
(61, 'gamma_globulins', 'GAM_Гамма-глобулины_Gamma globulins', 'Gamma Гамма-глобулин'),
(67, 'antibodies-to-thyroglobulin', 'ATTG_антител к тиреоглобулину_antibodies to thyroglobulin', 'Tg-Ab_ATG_Антитела к тиреоглобулину'),
(68, 'antibody-to-thyroid-peroxidase', 'ATPO_тиреопероксидазе_antibody to thyroid peroxidase ', 'TPOAb_Антитела к пероксидазе тиреоцитов');
UPDATE doc10_alias_change SET new_value = old_value || '_' || added;
\if :reverse
UPDATE doc10_alias_change SET old_value = new_value, new_value = old_value;
\endif
LOCK TABLE "analysisPoint" IN SHARE ROW EXCLUSIVE MODE;
DO $$ BEGIN
IF (SELECT count(*) FROM "analysisPoint" p JOIN doc10_alias_change c ON p.id = c.id AND trim(p.name) = c.name) <> 9
OR EXISTS (SELECT 1 FROM "analysisPoint" p JOIN doc10_alias_change c ON p.id = c.id WHERE p."translationParsing" IS DISTINCT FROM c.old_value)
THEN RAISE EXCEPTION 'Catalog precondition failed; no changes applied'; END IF;
END $$;
CREATE TEMP TABLE doc10_preserved_state ON COMMIT DROP AS
SELECT count(*) AS total, md5(jsonb_agg(CASE WHEN p.id IN (SELECT id FROM doc10_alias_change) THEN to_jsonb(p) - 'translationParsing' ELSE to_jsonb(p) END ORDER BY p.id)::text) AS checksum FROM "analysisPoint" p;
UPDATE "analysisPoint" p SET "translationParsing" = c.new_value FROM doc10_alias_change c WHERE p.id = c.id;
DO $$ BEGIN
IF (SELECT md5(jsonb_agg(CASE WHEN p.id IN (SELECT id FROM doc10_alias_change) THEN to_jsonb(p) - 'translationParsing' ELSE to_jsonb(p) END ORDER BY p.id)::text) FROM "analysisPoint" p)
IS DISTINCT FROM (SELECT checksum FROM doc10_preserved_state)
OR (SELECT count(*) FROM "analysisPoint") <> (SELECT total FROM doc10_preserved_state)
THEN RAISE EXCEPTION 'Unrelated catalog state changed; rolling back'; END IF;
END $$;
SELECT count(*) AS verified_rows FROM "analysisPoint" p JOIN doc10_alias_change c ON p.id = c.id AND p."translationParsing" = c.new_value;
\if :apply
COMMIT;
\else
ROLLBACK;
\endif
