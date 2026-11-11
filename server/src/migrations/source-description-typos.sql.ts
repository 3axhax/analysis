export const SOURCE_DESCRIPTION_TYPOS_SQL = String.raw`
DO $$
BEGIN
 LOCK TABLE "analysisResultDescription", "analysisResultDescriptionCondition" IN SHARE ROW EXCLUSIVE MODE;
 IF (SELECT count(*) FROM "analysisResultDescription" WHERE "sourceId" IS NULL AND ((id=3 AND md5(description_ru)='8f8397dbe19885457bb8dd0eed1b2189') OR (id=4 AND md5(description_ru)='b89f3130d3e23a15a084ea18ff9c6f74') OR (id=12 AND md5(description_ru)='7770d4820074cffade27589f131c0fe2') OR (id=31 AND md5(description_ru)='5a4333675498f0f2cd0d0a7cccc900fc')))<>4 THEN RAISE EXCEPTION 'Unexpected descriptions'; END IF;
 UPDATE "analysisResultDescription" SET description_ru=replace(description_ru,E').\nВ12',').</li><li>В12'),"updatedAt"=now() WHERE id=3;
 UPDATE "analysisResultDescription" SET description_ru=replace(description_ru,'диарея, рвота диабет','диарея, рвота, диабет'),"updatedAt"=now() WHERE id=4;
 UPDATE "analysisResultDescription" SET description_ru=replace(description_ru,'Снижения синтеза соляной кислоты','Снижение синтеза соляной кислоты'),"updatedAt"=now() WHERE id=12;
 UPDATE "analysisResultDescription" SET description_ru=replace(description_ru,'вирусЭпштейн-Барр','вирус Эпштейна — Барр'),"updatedAt"=now() WHERE id=31;
 IF NOT EXISTS (SELECT 1 FROM "analysisResultDescription" WHERE id=3 AND position(').</li><li>В12' in description_ru)>0 AND (SELECT count(*) FROM regexp_matches(description_ru,'<li>','g'))=(SELECT count(*) FROM regexp_matches(description_ru,'</li>','g'))) OR EXISTS (SELECT 1 FROM "analysisResultDescription" WHERE (id=4 AND position('рвота диабет' in description_ru)>0) OR (id=12 AND position('Снижения синтеза' in description_ru)>0) OR (id=31 AND position('вирусЭпштейн' in description_ru)>0)) THEN RAISE EXCEPTION 'Correction failed'; END IF;
END $$;
`;
