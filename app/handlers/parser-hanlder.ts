import { ipcMain } from 'electron';
const collector = require("../../collector/index");
const logger = require("../../lib/logger");
const inspector = require("../../inspector/index");

export class ParserHandlher {
    constructor(){

    }

    registerHandlers(){
        ipcMain.handle('parseHar', this.parseHar);
    }

    async parseHar (event, har, args){
        const collect = await collector(args, logger.create({}, args));
        await collect.createSessionFromHar(har);
        await collect.collectCookies();

        await logger.waitForComplete(collect.logger);

        const inspect = await inspector(
            args,
            collect.logger,
            collect.pageSession,
            collect.output
        );

        await inspect.inspectCookies();
        await inspect.inspectBeacons();
        await inspect.inspectHosts();


        return collect.output;
    }

    unregisterHandlers(){
        ipcMain.removeHandler('parseHar');
    }
}