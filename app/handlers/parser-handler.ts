import { ipcMain } from 'electron';

import {HarCollector} from './collectors/har-collector';

const collector = require("../../collector/index");
const logger = require("../../lib/logger");
const inspector = require("../../inspector/index");

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