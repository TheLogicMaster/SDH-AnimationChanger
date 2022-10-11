import { ModalRootProps, findModuleChild } from 'decky-frontend-lib';
import React, { FC, CSSProperties } from 'react';

const EmptyModal = findModuleChild((m) => {
    if (typeof m !== 'object') return undefined;
    for (let prop in m) {
        if (
            m[prop]?.prototype?.OK &&
            m[prop]?.prototype?.Cancel &&
            m[prop]?.prototype?.render
        ) {
            return m[prop];
        }
    }
}) as FC<ModalRootProps & {style?: CSSProperties}>;

export default EmptyModal;