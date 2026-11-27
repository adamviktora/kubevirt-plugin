import { useMemo } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useCurrentTime from '@kubevirt-utils/hooks/useCurrentTime';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { PrometheusEndpoint } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetPrometheusPoll, useHubClusterName } from '@stolostron/multicluster-sdk';

import { MIGRATION_HISTORY_TIMESPAN } from '../utils/constants';
import { getMigrationHistoryQueries } from '../utils/queries';
import { type MigrationHistoryRow } from '../utils/types';
import { buildMigrationHistoryRows } from '../utils/utils';

type UseVMMigrationHistory = (vm: V1VirtualMachine) => {
  loaded: boolean;
  loadError: unknown;
  rows: MigrationHistoryRow[];
};

const useVMMigrationHistory: UseVMMigrationHistory = (vm) => {
  const currentTime = useCurrentTime();
  const [hubClusterName] = useHubClusterName();

  const cluster = getCluster(vm);
  const name = getName(vm);
  const namespace = getNamespace(vm);

  const queries = useMemo(
    () => getMigrationHistoryQueries({ cluster, hubClusterName, name, namespace }),
    [cluster, hubClusterName, name, namespace],
  );

  const prometheusProps = {
    cluster,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace,
    timespan: MIGRATION_HISTORY_TIMESPAN,
  };

  const [infoResponse, infoLoaded, infoError] = useFleetPrometheusPoll({
    ...prometheusProps,
    query: queries.info,
  });

  const [startResponse, startLoaded, startError] = useFleetPrometheusPoll({
    ...prometheusProps,
    query: queries.startTime,
  });

  const [endResponse, endLoaded, endError] = useFleetPrometheusPoll({
    ...prometheusProps,
    query: queries.endTime,
  });

  const rows = useMemo(
    () => buildMigrationHistoryRows(infoResponse, startResponse, endResponse),
    [infoResponse, startResponse, endResponse],
  );

  return {
    loaded: infoLoaded && startLoaded && endLoaded,
    loadError: infoError || startError || endError,
    rows,
  };
};

export default useVMMigrationHistory;
