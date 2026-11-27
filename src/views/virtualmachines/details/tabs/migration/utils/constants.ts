import { MS_PER_DAY } from '@kubevirt-utils/components/Charts/utils/utils';

// Prometheus metrics backing the VM migration history table.
// Added in CNV-95598 (kubevirt-observability-controller), shipping in CNV v5.1.0.
export const MIGRATION_INFO_METRIC = 'kubevirt_vmi_migration_info';
export const MIGRATION_START_TIME_METRIC = 'kubevirt_vmi_migration_start_time_seconds';
export const MIGRATION_END_TIME_METRIC = 'kubevirt_vmi_migration_end_time_seconds';

// Label keys on kubevirt_vmi_migration_info.
// NOTE: verify against the live metric (Observe → Metrics) — the CNV-95598 description
// is inconsistent about whether the VMI name is `vmi` or `name`. Centralized here so a
// mismatch is a one-line fix.
export const MIGRATION_INFO_LABELS = {
  migrationName: 'migration_name',
  phase: 'phase',
  reason: 'reason',
  result: 'result',
  sourceNode: 'source_node',
  targetNode: 'target_node',
  trigger: 'trigger',
  vmi: 'vmi',
};

// The start/end time metrics are VMI-scoped; like other kubevirt_vmi_* metrics they
// label the VMI name as `name`. They carry `migration_name`, used to join to the info metric.
export const MIGRATION_TIME_VMI_LABEL = 'name';
export const MIGRATION_TIME_MIGRATION_NAME_LABEL = 'migration_name';

// Default history window: 14 days
export const MIGRATION_HISTORY_TIMESPAN = 14 * MS_PER_DAY;

export const MIGRATION_HISTORY_COLUMN_KEYS = {
  duration: 'duration',
  failure: 'failure',
  sourceNode: 'source-node',
  started: 'started',
  status: 'status',
  targetNode: 'target-node',
  trigger: 'trigger',
};

// Raw `reason` label value meaning "no failure".
export const MIGRATION_REASON_NONE = 'none';
