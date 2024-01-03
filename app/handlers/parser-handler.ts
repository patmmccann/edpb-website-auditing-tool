import { ipcMain } from 'electron';

import {HarCollector} from './collectors/har-collector';

export class ParserHandler {
    constructor(){
        this.registerHandlers();
    }

    registerHandlers(){
        ipcMain.handle('parseHar', this.parseHar);
    }

    async parseHar (event, har, args){
        const collector = new HarCollector(har);
        return await collector.parseHar();
    }

    unregisterHandlers(){
        ipcMain.removeHandler('parseHar');
    }
}