import React from 'react';

import {
  Divider,
  Menu,
  MenuContainer,
  MenuContent,
  MenuProps,
  MenuSearch,
  MenuSearchInput,
  MenuToggle,
  SearchInput,
} from '@patternfly/react-core';

type SelectWithFilterProps = {
  children: React.ReactNode;
  input: string;
  menuProps?: MenuProps;
  onInputChange: (value: string) => void;
  onSelect: (_event, value: string) => void;
  selectedOptionIcon?: React.ReactNode;
  selectedOptionText?: string;
};

export const SelectWithFilter: React.FunctionComponent<SelectWithFilterProps> = ({
  children,
  input,
  menuProps,
  onInputChange,
  onSelect,
  selectedOptionIcon,
  selectedOptionText,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleRef = React.useRef<any>();
  const menuRef = React.useRef<any>();

  const toggle = (
    <MenuToggle
      onClick={() => {
        !isOpen && onInputChange('');
        setIsOpen(!isOpen);
      }}
      icon={selectedOptionIcon}
      isExpanded={isOpen}
      ref={toggleRef}
    >
      {selectedOptionText}
    </MenuToggle>
  );

  const menu = (
    <Menu isScrollable onSelect={onSelect} ref={menuRef} {...menuProps}>
      <MenuSearch>
        <MenuSearchInput>
          <SearchInput
            aria-label="Filter menu items"
            onChange={(_event, value) => onInputChange(value)}
            value={input}
          />
        </MenuSearchInput>
      </MenuSearch>
      <Divider />
      <MenuContent>{children}</MenuContent>
    </Menu>
  );

  return (
    <MenuContainer
      isOpen={isOpen}
      menu={menu}
      menuRef={menuRef}
      onOpenChange={(open) => setIsOpen(open)}
      onOpenChangeKeys={['Escape']}
      toggle={toggle}
      toggleRef={toggleRef}
    />
  );
};

export default SelectWithFilter;
