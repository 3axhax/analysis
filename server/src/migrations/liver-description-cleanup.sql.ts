export const LIVER_DESCRIPTION_CLEANUP_SQL = String.raw`
DO $$
DECLARE s record; t text;
BEGIN
 LOCK TABLE "analysisResultDescription", "analysisResultDescriptionCondition" IN SHARE ROW EXCLUSIVE MODE;
 FOR s IN SELECT * FROM (VALUES
  (46,'dec115fb75efdbcb80761a5795026837'),(83,'87baa8e430a47aee28803b56e83c2557'),
  (84,'ff26e5c4e28ee9627ebdb2b717e03632'),(85,'04026a3cdf5c7c77a6551aadfaefe354'),
  (88,'09c3d03df5e59a6ec375e9f0ac4d224d'),(89,'175f49236409df4c86cac36183ded9b9'),
  (96,'5235a724dd9b314535d6ad48a4a6e20a'),(97,'03f205abd5cc30dac3f5dc8becff89a8')
 ) x(id,hash) LOOP
  IF NOT EXISTS (SELECT 1 FROM "analysisResultDescription" WHERE id=s.id AND "sourceId" IS NULL AND md5(description_ru)=s.hash) THEN RAISE EXCEPTION 'Unexpected description %',s.id; END IF;
 END LOOP;
 IF (SELECT count(*) FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=46)<>4 OR (SELECT count(*) FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=46 AND (("pointId" IN (1,2,37,39)) AND status='1'))<>4 THEN RAISE EXCEPTION 'Unexpected Gilbert rule'; END IF;
 UPDATE "analysisResultDescription" SET description_ru='Повышение этих показателей может встречаться при синдроме Жильбера и других состояниях. По этому сочетанию нельзя установить причину.',"updatedAt"=now() WHERE id=46;
 SELECT description_ru INTO t FROM "analysisResultDescription" WHERE id=83;
 t:=replace(t,'<li>цирроз печени','<li>перегрузка железом или гемохроматоз</li><li>беременность</li><li>цирроз печени');
 UPDATE "analysisResultDescription" SET description_ru=t,"updatedAt"=now() WHERE id=83;
 SELECT description_ru INTO t FROM "analysisResultDescription" WHERE id=84;
 t:=replace(t,'аминоксилот','аминокислот');
 t:=replace(t,'витамина В6 желательной','витамин В6 желательно');
 t:=replace(t,'извне(остается','извне (остается');
 t:=replace(t,'<li>цирроз печени','<li>панкреатит</li><li>в методичке также упомянута возможная связь с повышенным содержанием аммиака</li><li>цирроз печени');
 UPDATE "analysisResultDescription" SET description_ru=t,"updatedAt"=now() WHERE id=84;
 SELECT description_ru INTO t FROM "analysisResultDescription" WHERE id=85;
 t:=replace(t,'<li>холестаз','<li>заболевания почек (в методичке указаны нормальные АЛТ и ГГТП)</li><li>повреждение клеток печени (в методичке указано повышение АЛТ)</li><li>паразитоз</li><li>холестаз');
 UPDATE "analysisResultDescription" SET description_ru=t,"updatedAt"=now() WHERE id=85;
 SELECT description_ru INTO t FROM "analysisResultDescription" WHERE id=88;
 t:=replace(t,'биллиарный','билиарный'); t:=replace(t,'повышение в 20 раз))','повышение в 20 раз)');
 t:=replace(t,'в связи с кальция, фосфора, витамина Д','в связи с дефицитом кальция, фосфора, витамина Д');
 t:=replace(t,'повышения функции паращитовидных желез: вымывается кальция','повышение функции паращитовидных желез: вымывается кальций');
 t:=replace(t,'партгормона','паратгормона');
 UPDATE "analysisResultDescription" SET description_ru=t,"updatedAt"=now() WHERE id=88;
 SELECT description_ru INTO t FROM "analysisResultDescription" WHERE id=89;
 t:=replace(t,'фосфотазы','фосфатазы');
 t:=replace(t,'гипотиреоз (снижение функции щитовидной железы, потребность в креатинине)','гипотиреоз (снижение функции щитовидной железы)</li><li>митохондриальная дисфункция (дефицит энергии, потребность в креатине)');
 t:=replace(t,'дефицитом железом и витамина В6, В9, В1','дефицитом железа и витаминов В6, В9, В12');
 UPDATE "analysisResultDescription" SET description_ru=t,"updatedAt"=now() WHERE id=89;
 SELECT description_ru INTO t FROM "analysisResultDescription" WHERE id=96;
 t:=replace(t,'с выбросом гемоглобина в плазму крови</li>','с выбросом гемоглобина в плазму крови)</li>');
 t:=replace(t,'<li>°нарушения','<li>нарушения');
 UPDATE "analysisResultDescription" SET description_ru=t,"updatedAt"=now() WHERE id=96;
 SELECT description_ru INTO t FROM "analysisResultDescription" WHERE id=97;
 t:=replace(t,'закупорки протока камнем.</li>','закупорки протока камнем).</li>');
 UPDATE "analysisResultDescription" SET description_ru=t,"updatedAt"=now() WHERE id=97;
 IF EXISTS (SELECT 1 FROM "analysisResultDescription" WHERE id IN (83,84,85,88,89,96,97) AND ((SELECT count(*) FROM regexp_matches(description_ru,'<li>','g'))<>(SELECT count(*) FROM regexp_matches(description_ru,'</li>','g')) OR (SELECT count(*) FROM regexp_matches(description_ru,'<ul>','g'))<>(SELECT count(*) FROM regexp_matches(description_ru,'</ul>','g')))) THEN RAISE EXCEPTION 'Invalid list markup'; END IF;
END $$;
`;
