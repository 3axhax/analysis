export const INSULIN_UNIT_DISPLAY_SQL = String.raw`
DO $$
DECLARE n integer;
BEGIN
 UPDATE translation SET value='мкЕд/л' WHERE lang='ru' AND namespace='entities' AND module='units' AND submodule='mkUnit/l' AND value='мкEд/мл';
 GET DIAGNOSTICS n=ROW_COUNT; IF n<>1 THEN RAISE EXCEPTION 'Unexpected Russian unit label'; END IF;
 UPDATE translation SET value='µIU/L' WHERE lang='en' AND namespace='entities' AND module='units' AND submodule='mkUnit/l' AND value='mkUnit/ml';
 GET DIAGNOSTICS n=ROW_COUNT; IF n<>1 THEN RAISE EXCEPTION 'Unexpected English unit label'; END IF;
END $$;
`;
