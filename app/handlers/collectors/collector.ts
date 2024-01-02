import { Logger, createLogger, format, transports } from 'winston';

import * as isDev from 'electron-is-dev';
import * as tmp from 'tmp';

tmp.setGracefulCleanup();

export abstract class Collector {
    _logger: Logger;
    _event_data: any[] = [];
    _start_date: Date;
    _end_date: Date | null;
    _args :any = null;

    constructor(){
        this.createLogger();
    }

    createLogger() {
        const transports_log = [];

        if (isDev) {
            transports_log.push(new transports.Console({
                level: "debug",
                silent: false,
                stderrLevels: ['error', 'debug', 'info', 'warn'],
                format: process.stdout.isTTY ? format.combine(format.colorize(), format.simple()) : format.json(),
            }));
        }

        transports_log.push(new transports.File({
            filename: tmp.tmpNameSync({ postfix: "-log.ndjson" }),
            level: "silly", // log everything to file
            format: format.json(),
        }));

        this._start_date = new Date();
        this._end_date = null;

        this._logger = createLogger({
            // https://stackoverflow.com/a/48573091/1407622
            format: format.combine(format.timestamp()),
            transports: transports_log,
        });
    }

    async refresh() {
        const event_data_all: any = await new Promise((resolve, reject) => {
            this.logger.query(
                {
                    start: 0,
                    order: "desc",
                    limit: Infinity,
                    fields: undefined
                },
                (err, results) => {
                    if (err) return reject(err);
                    return resolve(results.file);
                }
            );
        });

        // filter only events with type set
        this._event_data = event_data_all.filter((event) => {
            return !!event.type;
        });
    }

    get event_data() {
        return this._event_data;
    }

    get logger() {
        return this._logger;
    }

    get view() {
        return null;
    }

    get contents() {
        return null;
    }

    get isElectron(){
        return false;
    }

    get isHar(){
        return false;
    }

    end(){
        const logger = this.logger;
        return new Promise(async function (resolve, reject) {
            logger.on('finish', (info) => resolve(null));
            logger.end();
        });
    }

    get args(){
        return this._args;
    }

    abstract findInHeaders(details, header);

    abstract getUrlFromResponse(response : any);
    
    abstract get mainUrl();

    abstract cookies();
}