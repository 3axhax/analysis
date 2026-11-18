export const REMOVE_LEGACY_RESULT_TRIGGER_SQL = `
DROP TRIGGER IF EXISTS validate_result_conversion ON "analysisResultPointData";
DROP FUNCTION IF EXISTS validate_result_unit_conversion();
`;
