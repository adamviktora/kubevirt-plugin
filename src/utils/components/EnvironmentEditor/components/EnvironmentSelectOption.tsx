import React, { FC } from 'react';

import { SelectOption } from '@patternfly/react-core';

import { EnvironmentKind, MapKindToAbbr } from '../constants';
import { getEnvironmentOptionValue } from '../utils';

type EnvironmentSelectOptionProps = {
  isDisabled?: boolean;
  kind: EnvironmentKind;
  name: string;
};

const EnvironmentSelectOption: FC<EnvironmentSelectOptionProps> = ({ isDisabled, kind, name }) => (
  <SelectOption isDisabled={isDisabled} value={getEnvironmentOptionValue(name, kind)}>
    <span className="sr-only">{kind}</span>
    <span className={`co-m-resource-icon co-m-resource-${kind}`}>{MapKindToAbbr[kind]}</span>
    {name}
  </SelectOption>
);

export default EnvironmentSelectOption;
