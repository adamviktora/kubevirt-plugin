import React, { FC } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, Divider, SelectGroup, SelectList, SelectOption } from '@patternfly/react-core';

import { EnvironmentKind, MapKindToAbbr } from '../constants';
import useEnvironmentsResources from '../hooks/useEnvironmentsResources';
import { getEnvironmentOptionKind, getEnvironmentOptionName } from '../utils';

import EnvironmentSelectOption from './EnvironmentSelectOption';
import SelectWithFilter from './SelectWithFilter';

type EnvironmentSelectResourceProps = {
  diskName: string;
  environmentName?: string;
  environmentNamesSelected: string[];
  kind?: EnvironmentKind;
  namespace: string;
  onChange: (diskName: string, name: string, serial: string, kind: EnvironmentKind) => void;
  serial: string;
};

const EnvironmentSelectResource: FC<EnvironmentSelectResourceProps> = ({
  diskName,
  environmentName,
  environmentNamesSelected,
  kind,
  namespace,
  onChange,
  serial,
}) => {
  const { t } = useKubevirtTranslation();
  const [input, setInput] = React.useState('');

  const {
    configMaps,
    error: loadError,
    loaded,
    secrets,
    serviceAccounts,
  } = useEnvironmentsResources(namespace);

  if (!loaded) return <Loading />;

  if (loadError)
    return (
      <Alert
        className="co-alert co-alert--scrollable"
        isInline
        title={t('An error occurred')}
        variant="danger"
      >
        <div className="co-pre-line">{loadError?.message}</div>
      </Alert>
    );

  const onSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string) => {
    onChange(diskName, getEnvironmentOptionName(value), serial, getEnvironmentOptionKind(value));
  };

  const filteredSecrets = secrets.filter((secret) => secret.metadata.name.includes(input));
  const filteredConfigMaps = configMaps.filter((configMap) =>
    configMap.metadata.name.includes(input),
  );
  const filteredServiceAccounts = serviceAccounts.filter((serviceAccount) =>
    serviceAccount.metadata.name.includes(input),
  );
  const noResultsFound =
    !filteredSecrets.length && !filteredConfigMaps.length && !filteredServiceAccounts.length;

  const children = (
    <>
      {!!filteredSecrets.length && (
        <>
          <SelectGroup key="group1" label={t('Secrets')}>
            <SelectList>
              {filteredSecrets.map((secret) => (
                <EnvironmentSelectOption
                  isDisabled={environmentNamesSelected?.includes(secret.metadata.name)}
                  key={secret.metadata.name}
                  kind={EnvironmentKind.secret}
                  name={secret.metadata.name}
                />
              ))}
            </SelectList>
          </SelectGroup>
          <Divider key="divider1" />
        </>
      )}
      {!!filteredConfigMaps.length && (
        <>
          <SelectGroup key="group2" label={t('Config Maps')}>
            <SelectList>
              {filteredConfigMaps.map((configMap) => (
                <EnvironmentSelectOption
                  isDisabled={environmentNamesSelected?.includes(configMap.metadata.name)}
                  key={configMap.metadata.name}
                  kind={EnvironmentKind.configMap}
                  name={configMap.metadata.name}
                />
              ))}
            </SelectList>
          </SelectGroup>
          <Divider key="divider2" />
        </>
      )}
      {!!filteredServiceAccounts.length && (
        <SelectGroup key="group3" label={t('Service Accounts')}>
          <SelectList>
            {filteredServiceAccounts.map((serviceAccount) => (
              <EnvironmentSelectOption
                isDisabled={environmentNamesSelected?.includes(serviceAccount.metadata.name)}
                key={serviceAccount.metadata.name}
                kind={EnvironmentKind.serviceAccount}
                name={serviceAccount.metadata.name}
              />
            ))}
          </SelectList>
        </SelectGroup>
      )}
      {noResultsFound && (
        <SelectOption isAriaDisabled key="no results">
          {t('No results found')}
        </SelectOption>
      )}
    </>
  );

  return (
    <SelectWithFilter
      selectedOptionIcon={
        kind ? (
          <span className={`co-m-resource-icon co-m-resource-${kind}`}>{MapKindToAbbr[kind]}</span>
        ) : null
      }
      input={input}
      menuProps={{ 'aria-labelledby': 'environment-name-header' }}
      onInputChange={(value) => setInput(value)}
      onSelect={onSelect}
      selectedOptionText={environmentName ?? t('Select a resource')}
    >
      {children}
    </SelectWithFilter>
  );
};

export default EnvironmentSelectResource;
