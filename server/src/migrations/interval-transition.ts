import { Sequelize } from 'sequelize-typescript';
import { runRecordedMigration } from './run-recorded-migration';
import { INTERVAL_SCHEMA_SQL } from './interval-schema.sql';
import { INTERVAL_REFERENCE_BACKFILL_SQL } from './interval-reference-backfill.sql';
import { INTERVAL_CONDITION_BACKFILL_SQL } from './interval-condition-backfill.sql';
import { INTERVAL_DERITIS_BACKFILL_SQL } from './interval-deritis-backfill.sql';
import { INTERVAL_CUTOVER_SQL } from './interval-cutover.sql';
import {
  INTERVAL_ONE_SIDED_VALUES_SQL,
  INTERVAL_ONE_SIDED_CONDITIONS_SQL,
} from './interval-one-sided-source.sql';

/** Explicitly staged: do not add to startup until the coordinated cutover is approved. */
export async function prepareIntervalTransition(sequelize: Sequelize) {
  await runRecordedMigration(
    sequelize,
    '0055-interval-transition',
    20055,
    [
      INTERVAL_SCHEMA_SQL,
      INTERVAL_REFERENCE_BACKFILL_SQL,
      INTERVAL_ONE_SIDED_VALUES_SQL,
      INTERVAL_CONDITION_BACKFILL_SQL,
      INTERVAL_ONE_SIDED_CONDITIONS_SQL,
      INTERVAL_DERITIS_BACKFILL_SQL,
    ].join('\n'),
  );
}

/** Old schema is removed only after consumers and every data gap are addressed. */
export async function finishIntervalTransition(sequelize: Sequelize) {
  await runRecordedMigration(
    sequelize,
    '0056-interval-cutover',
    20056,
    INTERVAL_CUTOVER_SQL,
  );
}
