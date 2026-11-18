export const REMOVE_LEGACY_RULE_TRIGGER_SQL = `
DROP TRIGGER IF EXISTS protect_used_conversion_rule ON "unitConversionRule";
DROP FUNCTION IF EXISTS protect_used_unit_conversion_rule();
`;
