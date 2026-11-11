// Apply the explicitly approved common-reference removals and editorial fixes.
export const CBC_REFERENCE_AND_TEXT_CLEANUP_SQL = String.raw`
DO $$
DECLARE item record; point_id integer; age_id integer; unit_id integer; gender_row record; affected integer; text_value text;
BEGIN
 LOCK TABLE "analysisPointMinValue", "analysisPointMaxValue", "analysisResultDescription", "analysisResultDescriptionCondition" IN SHARE ROW EXCLUSIVE MODE;
 IF (SELECT count(*) FROM gender WHERE name IN ('m','f'))<>2 THEN RAISE EXCEPTION 'Expected both genders'; END IF;
 FOR item IN SELECT * FROM (VALUES
  ('lymphocyte-count','3_4y','%',33::float8,55::float8),
  ('lymphocyte-percentage','3_4y','%',30::float8,50::float8),
  ('neutrophil-count','5_6y','10^9/l',1.8::float8,8::float8),
  ('neutrophil-percentage','5_6y','%',40::float8,60::float8),
  ('rdw','0_1m','%',14.9::float8,18.7::float8)
 ) AS x(point_name,age_name,unit_name,lo,hi) LOOP
  SELECT id INTO STRICT point_id FROM "analysisPoint" WHERE name=item.point_name;
  SELECT id INTO STRICT age_id FROM ages WHERE name=item.age_name;
  SELECT id INTO STRICT unit_id FROM "analysisPointUnits" WHERE name=item.unit_name;
  FOR gender_row IN SELECT id FROM gender WHERE name IN ('m','f') LOOP
   IF (SELECT count(*) FROM "analysisPointMinValue" WHERE "pointId"=point_id AND "ageId"=age_id AND "genderId"=gender_row.id AND "unitId"=unit_id AND "sourceId" IS NULL)<>1 OR
      (SELECT count(*) FROM "analysisPointMaxValue" WHERE "pointId"=point_id AND "ageId"=age_id AND "genderId"=gender_row.id AND "unitId"=unit_id AND "sourceId" IS NULL)<>1 OR
      NOT EXISTS (SELECT 1 FROM "analysisPointMinValue" WHERE "pointId"=point_id AND "ageId"=age_id AND "genderId"=gender_row.id AND "unitId"=unit_id AND "sourceId" IS NULL AND "lowInclusive"=false AND value=item.lo) OR
      NOT EXISTS (SELECT 1 FROM "analysisPointMaxValue" WHERE "pointId"=point_id AND "ageId"=age_id AND "genderId"=gender_row.id AND "unitId"=unit_id AND "sourceId" IS NULL AND value=item.hi) THEN RAISE EXCEPTION 'Unexpected target reference'; END IF;
   DELETE FROM "analysisPointMinValue" WHERE "pointId"=point_id AND "ageId"=age_id AND "genderId"=gender_row.id AND "unitId"=unit_id AND "sourceId" IS NULL;
   GET DIAGNOSTICS affected=ROW_COUNT; IF affected<>1 THEN RAISE EXCEPTION 'Minimum removal mismatch'; END IF;
   DELETE FROM "analysisPointMaxValue" WHERE "pointId"=point_id AND "ageId"=age_id AND "genderId"=gender_row.id AND "unitId"=unit_id AND "sourceId" IS NULL;
   GET DIAGNOSTICS affected=ROW_COUNT; IF affected<>1 THEN RAISE EXCEPTION 'Maximum removal mismatch'; END IF;
  END LOOP;
 END LOOP;
 FOR item IN SELECT * FROM (VALUES
  (4,'c597d6db93cd2640773c8fd5c314bff7'),
  (12,'bc3b746de112a22d565617d728741804'),
  (18,'526892ece9cad6cd95ed28e1acc23f7a'),
  (19,'ea5a8ef0d5520d9d9cb4cc042e87b157'),
  (22,'5d9d2e8ee59d0a04c1379a3776669e2e'),
  (34,'51d24ad314c90ad2deb7bf46a188e4a0')
 ) AS x(description_id,expected_hash) LOOP
  IF (SELECT count(*) FROM "analysisResultDescription" WHERE id=item.description_id AND "sourceId" IS NULL AND md5(description_ru)=item.expected_hash)<>1 THEN RAISE EXCEPTION 'Unexpected common description'; END IF;
 END LOOP;
 FOR item IN SELECT * FROM (VALUES
  (4,'hemoglobin','1'), (12,'mcv','0'), (18,'rdw','0'),
  (19,'platelets','1'), (22,'mpv','0'), (34,'monocyte-count','1')
 ) AS x(description_id,point_name,expected_status) LOOP
  IF (SELECT count(*) FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=item.description_id)<>1 OR
     (SELECT count(*) FROM "analysisResultDescriptionCondition" c JOIN "analysisPoint" p ON p.id=c."pointId" WHERE c."descriptionId"=item.description_id AND p.name=item.point_name AND c.status::text=item.expected_status)<>1 THEN RAISE EXCEPTION 'Unexpected description conditions'; END IF;
 END LOOP;
 UPDATE "analysisResultDescription" SET description_ru=replace(description_ru,'</ul>','<li>Заболевания костного мозга, включая полицитемию.</li></ul>'),"updatedAt"=now() WHERE id=4;
 SELECT description_ru INTO STRICT text_value FROM "analysisResultDescription" WHERE id=12;
 IF position('хронических</li>'||chr(10)||'<li>инфекционных' IN text_value)=0 THEN RAISE EXCEPTION 'Unexpected MCV markup'; END IF;
 UPDATE "analysisResultDescription" SET description_ru=replace(text_value,'хронических</li>'||chr(10)||'<li>инфекционных','хронических инфекционных'),"updatedAt"=now() WHERE id=12;
 SELECT description_ru INTO STRICT text_value FROM "analysisResultDescription" WHERE id=18;
 IF position('</li> <li>' IN text_value)=0 THEN RAISE EXCEPTION 'Unexpected RDW markup'; END IF;
 UPDATE "analysisResultDescription" SET description_ru='<ul><li>'||replace(text_value,'</li> <li>','</li><li>')||'</li></ul>',"updatedAt"=now() WHERE id=18;
 SELECT description_ru INTO STRICT text_value FROM "analysisResultDescription" WHERE id=19;
 IF position('Гемliолитическая' IN text_value)=0 OR position('Мтации в гомеостазе' IN text_value)=0 OR position('в кишечник</li>' IN text_value)=0 OR position('коагулограмму</li>' IN text_value)=0 OR position('</ul>' IN text_value)=0 THEN RAISE EXCEPTION 'Unexpected platelet description'; END IF;
 text_value:=replace(text_value,'Гемliолитическая','Гемолитическая');
 text_value:=replace(text_value,'Мтации в гомеостазе','Мутации в гомеостазе');
 text_value:=replace(text_value,'в кишечник</li>','в кишечнике</li>');
 text_value:=replace(text_value,'коагулограмму</li>','коагулограмму)</li>');
 text_value:=replace(text_value,'</ul>','<li>Приём некоторых лекарственных препаратов, в том числе кортикостероидов и оральных контрацептивов.</li></ul>');
 UPDATE "analysisResultDescription" SET description_ru=text_value,"updatedAt"=now() WHERE id=19;
 SELECT description_ru INTO STRICT text_value FROM "analysisResultDescription" WHERE id=22;
 IF position('на уровне костного мозга</li>' IN text_value)=0 THEN RAISE EXCEPTION 'Unexpected MPV description'; END IF;
 UPDATE "analysisResultDescription" SET description_ru=replace(text_value,'на уровне костного мозга</li>','на уровне костного мозга)</li>'),"updatedAt"=now() WHERE id=22;
 SELECT description_ru INTO STRICT text_value FROM "analysisResultDescription" WHERE id=34;
 IF position('<li>'||chr(10) IN text_value)=0 OR position('<li></ul>' IN text_value)=0 THEN RAISE EXCEPTION 'Unexpected monocyte markup'; END IF;
 text_value:=replace(text_value,'<li>'||chr(10),'</li>'||chr(10));
 text_value:=replace(text_value,'<li></ul>','</li></ul>');
 UPDATE "analysisResultDescription" SET description_ru=text_value,"updatedAt"=now() WHERE id=34;
END $$;
`;
