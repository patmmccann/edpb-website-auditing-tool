/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { ipcMain } from 'electron';

import {HarCollector} from './collectors/har-collector';

export class ParserHandler {
    constructor(){
        this.registerHandlers();
    }

    registerHandlers(){
        ipcMain.handle('parseHar', this.parseHar);
    }

    async parseHar (event, har, settings){
        const collector = new HarCollector(har, settings);
        return await collector.parseHar();
    }

    unregisterHandlers(){
        ipcMain.removeHandler('parseHar');
    }
}