/**
 * One migration event in the VM's history, assembled from the
 * kubevirt_vmi_migration_info metric joined with the start/end time metrics.
 * One row per migration (keyed by migrationName), reflecting its final/latest state.
 */
export type MigrationHistoryRow = {
  /** end - start, in seconds; undefined while the migration is still ongoing. */
  durationSeconds?: number;
  /** unix seconds; undefined while ongoing. */
  endTime?: number;
  migrationName: string;
  /** Latest phase label (Pending | Scheduling | Running | Succeeded | Failed | …). */
  phase: string;
  /** Failure reason label (none | timeout | canceled | unschedulable | failed). */
  reason: string;
  /** result label (succeeded | failed | in_progress). */
  result: string;
  sourceNode: string;
  /** unix seconds; undefined if the start metric is absent. */
  startTime?: number;
  targetNode: string;
  /** trigger label (evacuation | workload_update | user). */
  trigger: string;
};
