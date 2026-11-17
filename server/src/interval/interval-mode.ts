/** Explicit opt-in prevents deploying half of the database transition. */
export const intervalModeEnabled = () =>
  process.env.INTERVAL_MODEL_ENABLED === 'true';
