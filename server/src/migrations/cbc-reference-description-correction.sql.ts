// Correct the specifically verified common CBC references and interpretation conditions.
export const CBC_REFERENCE_DESCRIPTION_CORRECTION_SQL = String.raw`
DO $$
DECLARE item record; r record; point_id integer; unit_id integer; target_count integer;
        h integer; e integer; v integer; c integer; mchc integer; iron integer; ferritin integer; transferrin integer; tibc integer;
        hb_status text; er_status text; mcv_status text; mch_status text; description_id integer;
        low_text text := 'Снижение гемоглобина в сочетании с такими значениями эритроцитов, MCV и MCH может встречаться при анемии; её причину по этому сочетанию установить нельзя.';
        normal_text text := 'Снижение эритроцитов при гемоглобине в пределах референса и таких значениях MCV и MCH может встречаться при различных состояниях; причина по этому сочетанию не определяется.';
BEGIN
 SELECT id INTO STRICT point_id FROM "analysisPoint" WHERE name='erythrocyte';
 SELECT id INTO STRICT unit_id FROM "analysisPointUnits" WHERE name='10^12/l';
 IF NOT EXISTS (SELECT 1 FROM analysis_point_units WHERE "pointId"=point_id AND "unitsId"=unit_id) THEN RAISE EXCEPTION 'Erythrocyte unit not permitted'; END IF;
 IF (SELECT count(*) FROM "analysisPointMinValue" WHERE "pointId"=point_id AND "sourceId" IS NULL)<>28 OR
    (SELECT count(*) FROM "analysisPointMaxValue" WHERE "pointId"=point_id AND "sourceId" IS NULL)<>28 THEN
   RAISE EXCEPTION 'Unexpected erythrocyte reference count';
 END IF;
 FOR item IN SELECT * FROM (VALUES
 ('0_1m','m',3.9,5.9),('0_1m','f',3.9,5.9),
 ('1_2m','m',3.1,5.3),('1_2m','f',3.1,5.3),
 ('2_3m','m',2.7,4.5),('2_3m','f',2.7,4.5),
 ('3_6m','m',3.1,5.1),('3_6m','f',3.1,5.1),
 ('6_12m','m',3.9,5.5),('6_12m','f',3.9,5.5),
 ('1_3y','m',3.8,4.8),('1_3y','f',3.8,4.8),
 ('3_5y','m',3.7,4.9),('3_5y','f',3.7,4.9),
 ('5_6y','m',3.7,4.9),('5_6y','f',3.7,4.9),
 ('6_9y','m',3.8,4.9),('6_9y','f',3.8,4.9),
 ('9_10y','m',3.9,5.1),('9_10y','f',3.9,5.1),
 ('10_12y','m',3.9,5.1),('10_12y','f',3.9,5.1),
 ('12_15y','m',4.1,5.2),('12_15y','f',3.8,5.0),
 ('15_18y','m',4.2,5.6),('15_18y','f',3.9,5.1),
 ('u18y','m',4.3,5.7),('u18y','f',3.8,5.1)
 ) AS expected(age_name,gender_name,lo,hi) LOOP
  SELECT a.id AS age_id,g.id AS gender_id INTO STRICT r FROM ages a CROSS JOIN gender g WHERE a.name=item.age_name AND g.name=item.gender_name;
  SELECT count(*) INTO target_count FROM "analysisPointMinValue" WHERE "pointId"=point_id AND "ageId"=r.age_id AND "genderId"=r.gender_id AND "unitId"=unit_id AND "sourceId" IS NULL AND "lowInclusive"=false AND value=trunc(item.lo);
  IF target_count<>1 THEN RAISE EXCEPTION 'Unexpected erythrocyte minimum for % %',item.age_name,item.gender_name; END IF;
  SELECT count(*) INTO target_count FROM "analysisPointMaxValue" WHERE "pointId"=point_id AND "ageId"=r.age_id AND "genderId"=r.gender_id AND "unitId"=unit_id AND "sourceId" IS NULL AND value=trunc(item.hi);
  IF target_count<>1 THEN RAISE EXCEPTION 'Unexpected erythrocyte maximum for % %',item.age_name,item.gender_name; END IF;
  UPDATE "analysisPointMinValue" SET value=item.lo WHERE "pointId"=point_id AND "ageId"=r.age_id AND "genderId"=r.gender_id AND "unitId"=unit_id AND "sourceId" IS NULL;
  UPDATE "analysisPointMaxValue" SET value=item.hi WHERE "pointId"=point_id AND "ageId"=r.age_id AND "genderId"=r.gender_id AND "unitId"=unit_id AND "sourceId" IS NULL;
 END LOOP;
 SELECT id INTO STRICT h FROM "analysisPoint" WHERE name='hemoglobin';
 SELECT id INTO STRICT e FROM "analysisPoint" WHERE name='erythrocyte';
 SELECT id INTO STRICT v FROM "analysisPoint" WHERE name='mcv';
 SELECT id INTO STRICT c FROM "analysisPoint" WHERE name='mch';
 SELECT id INTO STRICT mchc FROM "analysisPoint" WHERE name='mchc';
 SELECT id INTO STRICT iron FROM "analysisPoint" WHERE name='ferrum';
 SELECT id INTO STRICT ferritin FROM "analysisPoint" WHERE name='ferritin';
 SELECT id INTO STRICT transferrin FROM "analysisPoint" WHERE name='transferrin';
 SELECT id INTO STRICT tibc FROM "analysisPoint" WHERE name='tibc';
 IF (SELECT count(*) FROM "analysisResultDescription" WHERE id IN (43,44,59) AND "sourceId" IS NULL)<>3 THEN RAISE EXCEPTION 'Expected common descriptions missing'; END IF;
 IF NOT EXISTS (SELECT 1 FROM "analysisResultDescription" WHERE id=43 AND md5(description_ru)='9aeb5791dc021bda365e834f3e8855d8') OR
    NOT EXISTS (SELECT 1 FROM "analysisResultDescription" WHERE id=44 AND md5(description_ru)='74cd979db5c1d78f762ce48763d74c7b') OR
    NOT EXISTS (SELECT 1 FROM "analysisResultDescription" WHERE id=59 AND md5(description_ru)='8bbfd21e40a48b83eab8c5f991c9f3d5') THEN
   RAISE EXCEPTION 'Unexpected existing description text';
 END IF;
 IF (SELECT count(*) FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=43)<>4 OR
    (SELECT count(*) FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=43 AND "pointId" IN (h,e,v,c) AND status='0')<>4 OR
    (SELECT count(*) FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=44)<>3 OR
    (SELECT count(*) FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=44 AND (("pointId"=e AND status='0') OR ("pointId" IN (v,c) AND status='1')))<>3 OR
    (SELECT count(*) FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=59)<>7 OR
    (SELECT count(*) FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=59 AND "pointId" IN (h,iron,ferritin,v,c,transferrin,tibc) AND status='0')<>7 THEN
  RAISE EXCEPTION 'Unexpected description conditions';
 END IF;
 UPDATE "analysisResultDescriptionCondition" SET status='1' WHERE "descriptionId"=59 AND "pointId" IN (transferrin,tibc);
 INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId",status) VALUES (59,mchc,'0');
 UPDATE "analysisResultDescription" SET description_ru='Сочетание сниженных гемоглобина, железа, ферритина, MCV, MCH и MCHC с повышенными трансферрином и ОЖСС может встречаться при дефиците железа. Само по себе это сочетание не устанавливает диагноз.', "updatedAt"=now() WHERE id=59;
 INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId",status) VALUES (44,h,'-1');
 UPDATE "analysisResultDescription" SET description_ru='Снижение эритроцитов и повышение MCV и MCH при гемоглобине в пределах референса могут встречаться при изменениях кроветворения, в том числе при недостаточности витамина B12 или фолата. Причина по этому сочетанию не определяется.', "updatedAt"=now() WHERE id=44;
 UPDATE "analysisResultDescription" SET description_ru=low_text,"updatedAt"=now() WHERE id=43;
 -- The existing four-LOW rule represents one of twelve combinations in the source.
 FOREACH hb_status IN ARRAY ARRAY['0','-1'] LOOP
  FOREACH er_status IN ARRAY CASE WHEN hb_status='0' THEN ARRAY['0','-1'] ELSE ARRAY['0'] END LOOP
   FOREACH mcv_status IN ARRAY ARRAY['0','-1'] LOOP
    FOREACH mch_status IN ARRAY ARRAY['0','-1'] LOOP
     IF hb_status='0' AND er_status='0' AND mcv_status='0' AND mch_status='0' THEN CONTINUE; END IF;
     INSERT INTO "analysisResultDescription" (description_ru,"sourceId","createdAt","updatedAt") VALUES (CASE WHEN hb_status='0' THEN low_text ELSE normal_text END,NULL,now(),now()) RETURNING id INTO description_id;
     INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId",status) VALUES (description_id,h,hb_status::"enum_analysisResultDescriptionCondition_status"),(description_id,e,er_status::"enum_analysisResultDescriptionCondition_status"),(description_id,v,mcv_status::"enum_analysisResultDescriptionCondition_status"),(description_id,c,mch_status::"enum_analysisResultDescriptionCondition_status");
    END LOOP;
   END LOOP;
  END LOOP;
 END LOOP;
END $$;
`;
