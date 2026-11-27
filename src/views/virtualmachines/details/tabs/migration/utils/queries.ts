import { isEmpty } from '@kubevirt-utils/utils/utils';

import {
  MIGRATION_END_TIME_METRIC,
  MIGRATION_INFO_LABELS,
  MIGRATION_INFO_METRIC,
  MIGRATION_START_TIME_METRIC,
  MIGRATION_TIME_VMI_LABEL,
} from './constants';

type MigrationHistoryQueriesArgs = {
  cluster?: string;
  hubClusterName?: string;
  name?: string;
  namespace?: string;
};

export type MigrationHistoryQueries = {
  endTime?: string;
  info?: string;
  startTime?: string;
};

/**
 * Builds the PromQL for the three migration-history metrics, filtered to a single VM
 * (by VMI name + namespace, and cluster when on a managed cluster). Returns undefined
 * queries when name/namespace are missing so the poll is skipped.
 */
export const getMigrationHistoryQueries = ({
  cluster,
  hubClusterName,
  name,
  namespace,
}: MigrationHistoryQueriesArgs): MigrationHistoryQueries => {
  if (!name || !namespace) {
    return { endTime: undefined, info: undefined, startTime: undefined };
  }

  const isManagedCluster = !isEmpty(cluster) && cluster !== hubClusterName;
  const clusterFilter = isManagedCluster ? `,cluster='${cluster}'` : '';

  return {
    endTime: `${MIGRATION_END_TIME_METRIC}{${MIGRATION_TIME_VMI_LABEL}='${name}',namespace='${namespace}'${clusterFilter}}`,
    info: `${MIGRATION_INFO_METRIC}{${MIGRATION_INFO_LABELS.vmi}='${name}',namespace='${namespace}'${clusterFilter}}`,
    startTime: `${MIGRATION_START_TIME_METRIC}{${MIGRATION_TIME_VMI_LABEL}='${name}',namespace='${namespace}'${clusterFilter}}`,
  };
};
