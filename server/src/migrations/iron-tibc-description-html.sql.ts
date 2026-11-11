export const IRON_TIBC_DESCRIPTION_HTML_SQL = String.raw`
DO $$
DECLARE old_text text; new_text text;
BEGIN
 SELECT description_ru INTO STRICT old_text FROM "analysisResultDescription"
 WHERE id=55 AND "sourceId" IS NULL
   AND md5(description_ru)='c5961dc2af140f3d3ef0d19cc9a60c64';
 IF (SELECT count(*) FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=55)<>1
 OR (SELECT count(*) FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=55 AND "pointId"=25 AND status='1')<>1
 THEN RAISE EXCEPTION 'Unexpected description 55 conditions'; END IF;
 new_text := regexp_replace(old_text, '<li>([^<]*)<li>', E'<li>\\1</li>', 'g');
 IF (SELECT count(*) FROM regexp_matches(new_text, '<li>', 'g'))<>6
 OR (SELECT count(*) FROM regexp_matches(new_text, '</li>', 'g'))<>6
 OR replace(new_text, '</li>', '<li>')<>old_text
 THEN RAISE EXCEPTION 'Unexpected description 55 HTML'; END IF;
 UPDATE "analysisResultDescription" SET description_ru=new_text, "updatedAt"=now() WHERE id=55;
END $$;
`;
