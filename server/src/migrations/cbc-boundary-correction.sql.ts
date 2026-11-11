// Apply only the reference differences explicitly approved against the document.
export const CBC_BOUNDARY_CORRECTION_SQL = String.raw`
DO $$
DECLARE item record; point_id integer; age_id integer; gender_id integer; unit_id integer; lo_count integer; hi_count integer;
BEGIN
 FOR item IN
   SELECT * FROM (VALUES
     ('hematocrit','1_3y','m','%',32::float8,42::float8,32::float8,40::float8),
     ('hematocrit','1_3y','f','%',32::float8,42::float8,32::float8,40::float8),
     ('hematocrit','u18y','f','%',35::float8,42::float8,35::float8,45::float8),
     ('mch','u18y','m','pg',26::float8,34::float8,27::float8,34::float8)
   ) AS x(point_name,age_name,gender_name,unit_name,old_lo,old_hi,new_lo,new_hi)
   UNION ALL
   SELECT 'rdw',a.name,g.name,'%',11.6::float8,14.8::float8,11::float8,14.8::float8
   FROM ages a CROSS JOIN gender g WHERE a.name IN ('1_3y','3_5y','5_6y','6_9y','9_10y','10_12y','12_15y','15_18y','u18y') AND g.name IN ('m','f')
 LOOP
   SELECT id INTO STRICT point_id FROM "analysisPoint" WHERE name=item.point_name;
   SELECT id INTO STRICT age_id FROM ages WHERE name=item.age_name;
   SELECT id INTO STRICT gender_id FROM gender WHERE name=item.gender_name;
   SELECT id INTO STRICT unit_id FROM "analysisPointUnits" WHERE name=item.unit_name;
   IF NOT EXISTS (SELECT 1 FROM analysis_point_units WHERE "pointId"=point_id AND "unitsId"=unit_id) THEN RAISE EXCEPTION 'Unit not allowed'; END IF;
   SELECT count(*) INTO lo_count FROM "analysisPointMinValue" WHERE "pointId"=point_id AND "ageId"=age_id AND "genderId"=gender_id AND "sourceId" IS NULL;
   SELECT count(*) INTO hi_count FROM "analysisPointMaxValue" WHERE "pointId"=point_id AND "ageId"=age_id AND "genderId"=gender_id AND "sourceId" IS NULL;
   IF lo_count<>1 OR hi_count<>1 OR NOT EXISTS (SELECT 1 FROM "analysisPointMinValue" WHERE "pointId"=point_id AND "ageId"=age_id AND "genderId"=gender_id AND "unitId"=unit_id AND "sourceId" IS NULL AND "lowInclusive"=false AND value=item.old_lo) OR NOT EXISTS (SELECT 1 FROM "analysisPointMaxValue" WHERE "pointId"=point_id AND "ageId"=age_id AND "genderId"=gender_id AND "unitId"=unit_id AND "sourceId" IS NULL AND value=item.old_hi) THEN
     RAISE EXCEPTION 'Unexpected reference for % % %',item.point_name,item.age_name,item.gender_name;
   END IF;
   IF item.old_lo<>item.new_lo THEN UPDATE "analysisPointMinValue" SET value=item.new_lo WHERE "pointId"=point_id AND "ageId"=age_id AND "genderId"=gender_id AND "unitId"=unit_id AND "sourceId" IS NULL; END IF;
   IF item.old_hi<>item.new_hi THEN UPDATE "analysisPointMaxValue" SET value=item.new_hi WHERE "pointId"=point_id AND "ageId"=age_id AND "genderId"=gender_id AND "unitId"=unit_id AND "sourceId" IS NULL; END IF;
 END LOOP;
 IF (SELECT count(*) FROM ages WHERE name IN ('1_3y','3_5y','5_6y','6_9y','9_10y','10_12y','12_15y','15_18y','u18y'))<>9 OR (SELECT count(*) FROM gender WHERE name IN ('m','f'))<>2 THEN RAISE EXCEPTION 'Unexpected ages or genders'; END IF;
END $$;
`;
