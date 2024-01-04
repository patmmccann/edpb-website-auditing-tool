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