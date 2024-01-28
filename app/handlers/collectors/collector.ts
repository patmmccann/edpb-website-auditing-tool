/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 * 
 * Based on https://github.com/EU-EDPS/website-evidence-collector/blob/master/lib/logger.js
 * from the Website Evidence Collector (https://github.com/EU-EDPS/website-evidence-collector)
 */
import { Logger, createLogger, format, transports } from 'winston';

import * as isDev from 'electron-is-dev';
import * as tmp from 'tmp';
import { BeaconCard } from '../cards/beacon-card';
import { HTTPCard } from '../cards/http-card';
import { CookieCard } from '../cards/cookie-card';
import { TestSSLCard } from '../cards/testssl-card';
import { TrafficCard } from '../cards/traffic-card';
import { UnsafeFormCard } from '../cards/unsafe-form-card';
import { LocalStorageCard } from '../cards/local-storage-card';
import { Card } from '../cards/card';



tmp.setGracefulCleanup();

export abstract class Collector {
    _logger: Logger;
    _event_data: any[] = [];
    _start_date: Date;
    _end_date: Date | null;
    _settings :any = {};
    _onBeforeRequestCallbacks : { (details: Electron.OnBeforeRequestListenerDetails): void; } [] = [];
    _onHeadersReceivedCallbacks : { (details: Electron.OnHeadersReceivedListenerDetails): void; } [] = [];
    _domReadyCallbacks : { (): void; } [] = [];
    _event_logger = {};

    constructor(settings){
        if (settings){
            this._settings = settings;
        }
        this.createLogger();
    }

    createLogger() {
        const transports_log = [];

        transports_log.push(new transports.Console({
                level: "debug",
                silent: false,
                stderrLevels: ['error', 'debug', 'info', 'warn'],
                format: process.stdout.isTTY ? format.combine(format.colorize(), format.simple()) : format.json(),
        }));

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

    get event_logger(){
        return this._event_logger;
    }

    end(){
        const logger = this.logger;
        return new Promise(async function (resolve, reject) {
            logger.on('finish', (info) => resolve(null));
            logger.end();
        });
    }

    get settings(){
        return this._settings;
    }

    set settings(settings){
        this._settings = settings;
    }

    get onBeforeRequestCallbacks(){
        return this._onBeforeRequestCallbacks;
    }

    get onHeadersReceivedCallbacks(){
        return this._onHeadersReceivedCallbacks;
    }

    get domReadyCallbacks(){
        return this._domReadyCallbacks;
    }

    abstract findInHeaders(details, header);

    abstract getUrlFromResponse(response : any);
    
    abstract get mainUrl();

    abstract cookies();

    createCardFromSettings() : Card[]{
        const cards = [];

        for (const [key, value] of Object.entries(this._settings)) {
            if (value == true){
                switch(key){
                    case 'beacons':
                        cards.push(new BeaconCard(this));
                        break;
                    case 'cookies':
                        cards.push(new CookieCard(this));
                        break;
                    case 'https':
                        cards.push(new HTTPCard(this));
                        break;
                    case 'testssl':
                        cards.push(new TestSSLCard(this));
                        break;
                    case 'traffic':
                        cards.push(new TrafficCard(this));
                        break;
                    case 'webform':
                        cards.push(new UnsafeFormCard(this));
                        break;
                    case 'localstorage':
                        cards.push(new LocalStorageCard(this));
                        break;
                    default:
                        break;
                }
            }
        }

        return cards;
    }
}