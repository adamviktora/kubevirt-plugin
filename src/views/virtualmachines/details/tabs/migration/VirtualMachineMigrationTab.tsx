import { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { type NavPageComponentProps } from '@virtualmachines/details/utils/types';

import VirtualMachineMigrationList from './components/list/VirtualMachineMigrationList';

const VirtualMachineMigrationTab: FC<NavPageComponentProps> = ({ obj: vm }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <ListPageHeader title={t('Compute migrations')} />
      <ListPageBody>
        <VirtualMachineMigrationList vm={vm} />
      </ListPageBody>
    </>
  );
};

export default VirtualMachineMigrationTab;
