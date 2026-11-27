import { type FC, useMemo } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCluster } from '@multicluster/helpers/selectors';

import useVMMigrationHistory from '../../hooks/useVMMigrationHistory';
import { MIGRATION_HISTORY_COLUMN_KEYS } from '../../utils/constants';
import { type MigrationHistoryRow } from '../../utils/types';
import {
  getMigrationHistoryRowId,
  getMigrationHistoryTableColumns,
  type MigrationHistoryTableCallbacks,
} from './migrationHistoryTableDefinition';

type VirtualMachineMigrationListProps = {
  vm: V1VirtualMachine;
};

const VirtualMachineMigrationList: FC<VirtualMachineMigrationListProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const { loaded, loadError, rows } = useVMMigrationHistory(vm);

  const columns = useMemo(() => getMigrationHistoryTableColumns(t), [t]);
  const callbacks: MigrationHistoryTableCallbacks = useMemo(
    () => ({ cluster: getCluster(vm) }),
    [vm],
  );

  return (
    <KubevirtTable<MigrationHistoryRow, MigrationHistoryTableCallbacks>
      ariaLabel={t('Compute migrations history table')}
      callbacks={callbacks}
      columns={columns}
      data={rows}
      getRowId={getMigrationHistoryRowId}
      initialSortDirection="desc"
      initialSortKey={MIGRATION_HISTORY_COLUMN_KEYS.started}
      loaded={loaded}
      loadError={loadError}
      noDataMsg={t('No compute migrations found for this VirtualMachine.')}
    />
  );
};

export default VirtualMachineMigrationList;
