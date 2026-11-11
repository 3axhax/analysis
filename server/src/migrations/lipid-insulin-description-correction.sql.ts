export const LIPID_INSULIN_DESCRIPTION_CORRECTION_SQL = String.raw`
DO $$
DECLARE n integer; before_conditions integer;
BEGIN
 LOCK TABLE "analysisResultDescription", "analysisResultDescriptionCondition" IN SHARE ROW EXCLUSIVE MODE;
 SELECT count(*) INTO before_conditions FROM "analysisResultDescriptionCondition" WHERE "descriptionId" IN (99,110);
 IF before_conditions<>2 OR NOT EXISTS (SELECT 1 FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=99 AND "pointId"=40 AND status::text='1') OR NOT EXISTS (SELECT 1 FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=110 AND "pointId"=45 AND status::text='0') THEN RAISE EXCEPTION 'Description conditions mismatch'; END IF;
 UPDATE "analysisResultDescription" SET description_ru=replace(description_ru,'<li>сахарный диабет, инсулинорезистентность','<li>гипотиреоз (никак не леченное снижение функции щитовидной железы; чем выше ТТГ, тем выше холестерин)</li> <li>сахарный диабет, инсулинорезистентность'),"updatedAt"=now() WHERE id=99 AND "sourceId" IS NULL AND md5(description_ru)='7432868d6be5822c3d8a27fdc6907130' AND position('<li>сахарный диабет, инсулинорезистентность' IN description_ru)>0;
 GET DIAGNOSTICS n=ROW_COUNT; IF n<>1 THEN RAISE EXCEPTION 'Description 99 mismatch'; END IF;
 UPDATE "analysisResultDescription" SET description_ru=replace(description_ru,'инсулиномдефицит витаминов группы Ва','инсулино-дефицит витаминов группы Ва'),"updatedAt"=now() WHERE id=110 AND "sourceId" IS NULL AND md5(description_ru)='f8a5523f7750a029437277b66e0b8d4f' AND position('инсулиномдефицит витаминов группы Ва' IN description_ru)>0;
 GET DIAGNOSTICS n=ROW_COUNT; IF n<>1 THEN RAISE EXCEPTION 'Description 110 mismatch'; END IF;
 IF (SELECT count(*) FROM "analysisResultDescriptionCondition" WHERE "descriptionId" IN (99,110))<>before_conditions THEN RAISE EXCEPTION 'Description conditions changed'; END IF;
END $$;
`;
