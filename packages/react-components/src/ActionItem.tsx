// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Proposal } from '@polkadot/types/interfaces';

import BN from 'bn.js';
import React from 'react';
import styled from 'styled-components';

import Card from './Card';
import ProposedAction, { styles as proposedActionStyles } from './ProposedAction';
import { styles as rowStyles } from './Row';

interface Props {
  className?: string;
  children?: React.ReactNode;
  accessory?: React.ReactNode;
  proposal?: Proposal | null;
  idNumber: BN | number | string;
  expandNested?: boolean;
}

export const styles = `
  ${rowStyles}
  ${proposedActionStyles}
`;

function ActionItem ({ className, children, accessory, idNumber, proposal, expandNested }: Props): React.ReactElement<Props> {
  return (
    <Card className={className}>
      <div className='ui--Row'>
        <div className='ui--Row-base'>
          <div className='ui--Row-details'>
            <ProposedAction
              idNumber={idNumber}
              isCollapsible
              proposal={proposal}
              withLinks={expandNested}
              expandNested={expandNested}
            />
          </div>
          {accessory}
        </div>
        {children}
      </div>
    </Card>
  );
}

export default styled(ActionItem)`${styles}`;
