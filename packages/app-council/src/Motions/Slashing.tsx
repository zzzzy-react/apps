// Copyright 2017-2020 @polkadot/ui-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AccountId } from '@polkadot/types/interfaces';
import { CallFunction } from '@polkadot/types/types';

import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Input, InputAddress, Modal, TxButton } from '@polkadot/react-components';
import { useApi, useCall, useToggle } from '@polkadot/react-hooks';

import { useTranslation } from '../translate';
import useAvailableSlashes from './useAvailableSlashes';

interface Props {
  className?: string;
  isMember: boolean;
}

interface Option {
  text: string;
  value: number;
}

export default function Slashing ({ className, isMember }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const members = useCall<AccountId[]>(api.query.electionsPhragmen?.members || api.query.elections.members, []);
  const slashes = useAvailableSlashes();
  const [isVisible, toggleVisible] = useToggle();
  const [isSelectedMember, setIsMember] = useState(false);
  const [accountId, setAcountId] = useState<string | null>(null);
  const [proposal, setProposal] = useState<CallFunction | null>(null);
  const [eras, setEras] = useState<Option[]>([]);
  const [selectedEra, setSelectedEra] = useState(0);
  const threshold = Math.ceil((members?.length || 0) * 0.75);

  useEffect((): void => {
    if (accountId && members) {
      setIsMember(
        members
          .map(([accountId]): string => accountId.toString())
          .includes(accountId)
      );
    }
  }, [accountId, members]);

  useEffect((): void => {
    if (slashes?.length) {
      setEras(
        slashes.map(([era, slashes]): Option => ({
          text: t('era {{era}}, {{count}} slashes', {
            replace: {
              count: slashes.length,
              era: era.toNumber()
            }
          }),
          value: era.toNumber()
        }))
      );
    } else {
      setEras([]);
    }
  }, [slashes]);

  useEffect((): void => {
    const actioned = selectedEra && slashes?.find(([era]): boolean => era.eqn(selectedEra));

    setProposal((): any =>
      actioned
        ? api.tx.staking.cancelDeferredSlash(actioned[0], actioned[1].map((_, index): number => index))
        : null
    );
  }, [selectedEra, slashes]);

  return (
    <>
      <Button
        icon='cancel'
        isDisabled={!isMember || !members?.length || !slashes.length}
        isPrimary
        label={t('Cancel slashes')}
        onClick={toggleVisible}
      />
      {isVisible && (
        <Modal
          className={className}
          header={t('Revert pending slashes')}
          open
        >
          <Modal.Content>
            <InputAddress
              help={t('Select the account you wish to make the proposal with.')}
              label={t('propose from account')}
              onChange={setAcountId}
              type='account'
              withLabel
            />
            {eras.length
              ? (
                <Dropdown
                  defaultValue={eras[0].value}
                  help={t('The unapplied slashed era to cancel.')}
                  label={t('the era to cancel for')}
                  onChange={setSelectedEra}
                  options={eras}
                />
              )
              : (
                <Input
                  isDisabled
                  label={t('the era to cancel for')}
                  value={t('no unapplied slashes found')}
                />
              )
            }
          </Modal.Content>
          <Modal.Actions>
            <Button.Group>
              <Button
                isNegative
                icon='cancel'
                label={t('Cancel')}
                onClick={toggleVisible}
              />
              <Button.Or />
              <TxButton
                accountId={accountId}
                icon='repeat'
                isDisabled={!threshold || !isSelectedMember || !proposal}
                isPrimary
                label={t('Revert')}
                onStart={toggleVisible}
                params={[threshold, proposal]}
                tx='council.propose'
              />
            </Button.Group>
          </Modal.Actions>
        </Modal>
      )}
    </>
  );
}
