
import { BrowserView, WebContents, ipcMain } from 'electron';
import {TrafficCard} from "../cards/traffic-card";
import {BeaconCard} from "../cards/beacon-card";
import {CookieCard} from "../cards/cookie-card";
import {LocalStorageCard} from "../cards/local-storage-card";
import {UnsafeFormCard} from "../cards/unsafe-form-card";

const collector_connection = require("../../../collector/connection");

import { Logger, createLogger, format, transports } from 'winston';

const {report_event_logger } = require("../../../lib/setup-cookie-recording");


import * as tmp from 'tmp';
import * as isDev from 'electron-is-dev';

tmp.setGracefulCleanup();

export class CollectorSession {
    _output: any = null;
    _logger: Logger;
    _refs_regexp: RegExp;
    _uri_ins: string;
    _uri_ins_host: string;
    _uri_refs: string[];
    _start_date : Date;
    _end_date : Date | null;
    _session_name: string;
    _view: BrowserView;
    _contents: WebContents;
    _traffic_card : TrafficCard;
    _beacon_card : BeaconCard;
    _cookie_card : CookieCard;
    _local_storage_card : LocalStorageCard;
    _unsafe_form_card : UnsafeFormCard;
    _event_data : any[] = [];

    constructor(session_name, args) {
        this._session_name = session_name;
        
        this.createLogger();
        this._traffic_card =  new TrafficCard(this);
        this._beacon_card =  new BeaconCard(this);
        this._cookie_card =  new CookieCard(this);
        this._local_storage_card =  new LocalStorageCard(this);
        this._unsafe_form_card = new UnsafeFormCard(this);
    }

    createLogger() {
        const transports_log = [];

        if (isDev){
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

    async createCollector(view:BrowserView, args) {
        this._view = view;
        this._contents = view.webContents; 


        ipcMain.handle('reportEvent' + this._session_name, async (reportEvent, type, stack, data, location) => {
            report_event_logger(this.logger, type, stack, data, JSON.parse(location));
        });



        // forward logs from the browser console
        this._contents.on("console-message", (event, level, msg, line, sourceId) =>
            this.logger.log("debug", msg, { type: "Browser.Console" })
        );

        // forward logs from each requests browser console
        this._contents.session.webRequest.onBeforeRequest(async (details, callback) => {
            this._traffic_card.add(details);
            this._beacon_card.add(details);
            callback({});
        });

        // setup tracking
        this._contents.session.webRequest.onHeadersReceived(async (details, callback) => {
            this._cookie_card.add(details);
            callback({});
        });
    }

    end(){
        this._contents.session.webRequest.onBeforeRequest(null, null);
        this._contents.session.webRequest.onHeadersReceived(null, null);
        ipcMain.removeHandler('reportEvent' + this._session_name);
        
        this._end_date = new Date();
        const logger = this.logger;
        return new Promise(async function (resolve, reject) {
            logger.on('finish', (info)  => resolve(null));
            logger.end();
        });
    }

    async clear(args) {
        this.createLogger();
        this._traffic_card.clear();
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

    get event_data() {
        return this._event_data;
    }

    get view(){
        return this._view;
    }

    get contents(){
        return this._view.webContents;
    }

    async refresh(){
        const event_data_all :any = await new Promise((resolve, reject) => {
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

    async collect(kinds, args) {
        this.refresh();

        const output: any = {};

        for (let kind of kinds) {
            switch (kind) {
                case 'cookie':
                    output.cookies = await this._cookie_card.inspect();
                    break;
                case 'https':
                    if (this.contents.getURL()) {
                        await collector_connection.testHttps(this.contents.getURL(), output);
                    }
                    break;
                case 'testSSL':
                    //if (!collect.output.uri_ins) return testssl_example;
                    if (this.contents.getURL()) {
                        if (args.testssl_type == 'script') {
                            collector_connection.testSSLScript(
                                this.contents.getURL(),
                                args,
                                this.logger,
                                output
                            );
                        } else if (args.testssl_type == 'docker') {
                            collector_connection.testSSLDocker(
                                this.contents.getURL(),
                                args,
                                this.logger,
                                output
                            );
                        } else {
                            output.testSSLError = "Unknow method for testssl, go to settings first.";
                        }

                    } else {
                        output.testSSLError = "No url given to test_ssl.sh";
                    }
                    break;
                case 'localstorage':
                    output.localStorage = await this._local_storage_card.inspect();
                    break;

                case 'traffic':
                    output.hosts = {};
                    output.hosts.requests = {};
                    output.hosts.requests.thirdParty = this._traffic_card.inspect();
                    break;

                case 'forms':
                    output.unsafeForms =  await this._unsafe_form_card.inspect();
                    break;

                case 'beacons':
                    output.beacons = this._beacon_card.inspect();
                    break;
            }
        }


        return output;
    }
}