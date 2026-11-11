export const SOURCE_DESCRIPTION_CONCISION_SQL = String.raw`
DO $$
DECLARE item record; n integer;
BEGIN
 LOCK TABLE "analysisResultDescription", "analysisResultDescriptionCondition", "medicalSource" IN SHARE ROW EXCLUSIVE MODE;
 FOR item IN SELECT * FROM (VALUES
 ('b368ede55afc88eede15fde3dc300da3','https://pmc.ncbi.nlm.nih.gov/articles/PMC5986027/','Возможен дефицит железа без анемии.'),
 ('22f284f626c30d099eb009b2edb2b017','https://nutritionalassessment.org/iron/','Возможна железодефицитная анемия. Порог гемоглобина для женщин относится к небеременным.'),
 ('340b1ea34c76b2e237250093fce759fa','https://nutritionalassessment.org/iron/','Возможен дефицит железа.'),
 ('5736d7378cf0fe44947b02f2bb21ccc2','https://nutritionalassessment.org/iron/','Возможны воспаление и некоторые хронические заболевания.'),
 ('afe2c1baffb9bfb5581c9d85f29ddd24','https://pmc.ncbi.nlm.nih.gov/articles/PMC6835368/','Возможна микроцитарная анемия. Среди возможных причин — недостаток железа, талассемия и некоторые другие состояния.'),
 ('5b3fbfdb24c9128efb9969c1b74948b5','https://pmc.ncbi.nlm.nih.gov/articles/PMC6835368/','Возможна нормоцитарная анемия, в том числе при воспалительных состояниях или гемолизе.'),
 ('93e9e50cafa94a672fa5955e92d96f82','https://pmc.ncbi.nlm.nih.gov/articles/PMC6835368/','Возможна макроцитарная анемия. Среди возможных причин — недостаток витамина B12 или фолата.')
 ) x(old_hash,source_url,new_text) LOOP
  SELECT count(*) INTO n FROM "analysisResultDescription" d JOIN "medicalSource" s ON s.id=d."sourceId" WHERE s.metadata->>'url'=item.source_url AND md5(d.description_ru)=item.old_hash;
  IF n<>1 THEN RAISE EXCEPTION 'Unexpected source description'; END IF;
  UPDATE "analysisResultDescription" d SET description_ru=item.new_text,"updatedAt"=now() FROM "medicalSource" s WHERE s.id=d."sourceId" AND s.metadata->>'url'=item.source_url AND md5(d.description_ru)=item.old_hash;
  GET DIAGNOSTICS n=ROW_COUNT; IF n<>1 THEN RAISE EXCEPTION 'Source revision count'; END IF;
 END LOOP;
END $$;
`;
