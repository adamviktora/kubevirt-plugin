import { type TFunction } from 'i18next';

import { type ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';

import { MIGRATION_HISTORY_COLUMN_KEYS } from '../../utils/constants';
import { type MigrationHistoryRow } from '../../utils/types';
import { getTriggerLabel } from '../../utils/utils';
import {
  DurationCell,
  FailureCell,
  SourceNodeCell,
  StartedCell,
  StatusCell,
  TargetNodeCell,
  TriggerCell,
} from './MigrationHistoryCells';

export type MigrationHistoryTableCallbacks = {
  cluster?: string;
};

export const getMigrationHistoryTableColumns = (
  t: TFunction,
): ColumnConfig<MigrationHistoryRow, MigrationHistoryTableCallbacks>[] => [
  {
    getValue: (row) => row.sourceNode,
    key: MIGRATION_HISTORY_COLUMN_KEYS.sourceNode,
    label: t('Source node'),
    renderCell: (row, callbacks) => <SourceNodeCell cluster={callbacks?.cluster} row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => row.targetNode,
    key: MIGRATION_HISTORY_COLUMN_KEYS.targetNode,
    label: t('Destination node'),
    renderCell: (row, callbacks) => <TargetNodeCell cluster={callbacks?.cluster} row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => getTriggerLabel(row.trigger, t),
    key: MIGRATION_HISTORY_COLUMN_KEYS.trigger,
    label: t('Trigger'),
    renderCell: (row) => <TriggerCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => row.phase,
    key: MIGRATION_HISTORY_COLUMN_KEYS.status,
    label: t('Status'),
    renderCell: (row) => <StatusCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => row.reason,
    key: MIGRATION_HISTORY_COLUMN_KEYS.failure,
    label: t('Failure reason'),
    renderCell: (row) => <FailureCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => row.startTime ?? 0,
    key: MIGRATION_HISTORY_COLUMN_KEYS.started,
    label: t('Started'),
    renderCell: (row) => <StartedCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => row.durationSeconds ?? -1,
    key: MIGRATION_HISTORY_COLUMN_KEYS.duration,
    label: t('Duration'),
    renderCell: (row) => <DurationCell row={row} />,
    sortable: true,
  },
];

export const getMigrationHistoryRowId = (row: MigrationHistoryRow): string => row.migrationName;
