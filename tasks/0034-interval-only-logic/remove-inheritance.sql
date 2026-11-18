DO $$
BEGIN
 IF EXISTS (
   SELECT 1 FROM "sourceReferenceInheritance" h
   WHERE NOT EXISTS (
     SELECT 1 FROM "analysisResultDescription" d
     JOIN "analysisResultDescriptionCondition" c ON c."descriptionId"=d.id
     JOIN "analysisResultIntervalDescriptionCondition" l ON l."conditionId"=c.id
     JOIN "analysisPointIntervalValue" i ON i.id=l."intervalId"
     WHERE d."sourceId"=h."sourceId" AND c."pointId"=h."pointId" AND i."sourceId" IS NULL
   )
 ) THEN RAISE EXCEPTION 'Unmapped source reference inheritance'; END IF;
END $$;
DROP TABLE "sourceReferenceInheritance";
