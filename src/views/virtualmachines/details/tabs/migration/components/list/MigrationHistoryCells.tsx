import { type FC } from 'react';

import { MILLISECONDS_MULTIPLIER } from '@kubevirt-utils/components/Charts/utils/utils';
import NodeLink from '@kubevirt-utils/components/NodeLink/NodeLink';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getStatusIcon } from '@kubevirt-utils/resources/vmim/statusIcon';
import { formatElapsedTime } from '@kubevirt-utils/utils/elapsedTime';
import { GenericStatus } from '@openshift-console/dynamic-plugin-sdk';

import { type MigrationHistoryRow } from '../../utils/types';
import { getTriggerLabel, hasFailureReason } from '../../utils/utils';

type CellProps = {
  cluster?: string;
  row: MigrationHistoryRow;
};

export const SourceNodeCell: FC<CellProps> = ({ cluster, row }) => (
  <span data-test={`migration-history-source-${row.migrationName}`}>
    <NodeLink cluster={cluster} nodeName={row.sourceNode} />
  </span>
);

export const TargetNodeCell: FC<CellProps> = ({ cluster, row }) => (
  <span data-test={`migration-history-target-${row.migrationName}`}>
    <NodeLink cluster={cluster} nodeName={row.targetNode} />
  </span>
);

export const TriggerCell: FC<CellProps> = ({ row }) => {
  const { t } = useKubevirtTranslation();
  return (
    <span data-test={`migration-history-trigger-${row.migrationName}`}>
      {getTriggerLabel(row.trigger, t)}
    </span>
  );
};

export const StatusCell: FC<CellProps> = ({ row }) => {
  const StatusIcon = getStatusIcon(row.phase);
  return (
    <span data-test={`migration-history-status-${row.migrationName}`}>
      <GenericStatus Icon={StatusIcon} title={row.phase || NO_DATA_DASH} />
    </span>
  );
};

export const FailureCell: FC<CellProps> = ({ row }) => (
  <span data-test={`migration-history-failure-${row.migrationName}`}>
    {hasFailureReason(row.reason) ? row.reason : NO_DATA_DASH}
  </span>
);

export const StartedCell: FC<CellProps> = ({ row }) => (
  <span data-test={`migration-history-started-${row.migrationName}`}>
    {row.startTime === undefined ? (
      NO_DATA_DASH
    ) : (
      <Timestamp timestamp={row.startTime * MILLISECONDS_MULTIPLIER} />
    )}
  </span>
);

export const DurationCell: FC<CellProps> = ({ row }) => {
  const { t } = useKubevirtTranslation();
  const { durationSeconds, startTime } = row;

  let content: string = NO_DATA_DASH;
  if (durationSeconds !== undefined && durationSeconds >= 0) {
    content = formatElapsedTime(t, Math.round(durationSeconds));
  } else if (startTime !== undefined) {
    content = t('Ongoing');
  }

  return <span data-test={`migration-history-duration-${row.migrationName}`}>{content}</span>;
};
