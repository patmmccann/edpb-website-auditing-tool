
import * as path from 'path';
import * as tmp from 'tmp';
import { Logger, createLogger, format, transports } from 'winston'

tmp.setGracefulCleanup();

export class CollectorSession {
    _output: any = null;
    _hosts: any;
    _logger: Logger;
    _refs_regexp: RegExp;
    _uri_ins: string;
    _uri_ins_host: string;
    _uri_refs: string[];
    _start_date : Date;
    _end_date : Date | null;

    constructor() {
        this._hosts = {
            requests: {
                firstParty: new Set(),
                thirdParty: new Set(),
            },
            beacons: {
                firstParty: new Set(),
                thirdParty: new Set(),
            },
            cookies: {
                firstParty: new Set(),
                thirdParty: new Set(),
            },
            localStorage: {
                firstParty: new Set(),
                thirdParty: new Set(),
            },
            links: {
                firstParty: new Set(),
                thirdParty: new Set(),
            },
        }
        
        this.createLogger();
    }

    createLogger() {
        this._start_date = new Date();
        this._end_date = null;
        const logger = createLogger({
            // https://stackoverflow.com/a/48573091/1407622
            format: format.combine(format.timestamp()),
            transports: [
                new transports.Console({
                    level: "debug",
                    silent: false,
                    stderrLevels: ['error', 'debug', 'info', 'warn'],
                    format: process.stdout.isTTY ? format.combine(format.colorize(), format.simple()) : format.json(),
                }),
                new transports.File({
                    filename: tmp.tmpNameSync({ postfix: "-log.ndjson" }),
                    level: "silly", // log everything to file
                    format: format.json(),
                })
            ],
        });

        this._logger = logger;
    }

    end(){
        this._end_date = new Date();
        const logger = this.logger;
        return new Promise(async function (resolve, reject) {
            logger.on('finish', (info)  => resolve(null));
            logger.end();
        });
    }

    clear() {
        this._hosts = {
            requests: {
                firstParty: new Set(),
                thirdParty: new Set(),
            },
            beacons: {
                firstParty: new Set(),
                thirdParty: new Set(),
            },
            cookies: {
                firstParty: new Set(),
                thirdParty: new Set(),
            },
            localStorage: {
                firstParty: new Set(),
                thirdParty: new Set(),
            },
            links: {
                firstParty: new Set(),
                thirdParty: new Set(),
            },
        }

        this.createLogger();
    }

    get hosts() {
        return this._hosts;
    }

    get logger() {
        return this._logger;
    }

    get refs_regexp() {
        return this._refs_regexp;
    }

    get uri_ins() {
        return this._uri_ins;
    }

    get uri_ins_host() {
        return this._uri_ins_host;
    }

    get uri_refs() {
        return this._uri_refs;
    }
}