
import { BrowserView, WebContents, ipcMain } from 'electron';
import {TrafficCard} from "../cards/traffic-card";
import {BeaconCard} from "../cards/beacon-card";


const collector_connection = require("../../../collector/connection");

import { Logger, createLogger, format, transports } from 'winston'

const collector = require("../../../collector/index");
const inspector = require("../../../inspector/index");

const { setup_cookie_recording, report_event_logger } = require("../../../lib/setup-cookie-recording");

const {
    getLocalStorage,
} = require("../../../lib/tools");

import * as tmp from 'tmp';
import * as isDev from 'electron-is-dev';

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
    _tmp_collector: any;
    _session_name: string;
    _view: BrowserView;
    _contents: WebContents;
    _traffic_card : TrafficCard;
    _beacon_card : BeaconCard;

    constructor(session_name, args) {
        this._session_name = session_name;
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
        this._traffic_card =  new TrafficCard(this);
        this._beacon_card =  new BeaconCard(this);
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

        const collect = await collector(args);
        this._tmp_collector = collect;

        this._tmp_collector.refs_regexp = null;


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
            await setup_cookie_recording(details, this._view.webContents.mainFrame.url, this.logger);
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
        await this._tmp_collector.eraseSession(args);
        this.createLogger();
        this._traffic_card.clear();
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

    async collect(kinds, args) {
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
          const eventData = event_data_all.filter((event) => {
            return !!event.type;
          });

        const collect = this._tmp_collector;

        if (args) {
            collect.args = args;
        }

        const inspect = await inspector(
            collect.args,
            this.logger,
            collect.pageSession,
            collect.output
        );

        for (let kind of kinds) {
            switch (kind) {
                case 'cookie':
                    const cookies = await this._contents.session.cookies.get({});
                    await collect.collectCookies(cookies);
                    await inspect.inspectCookies(this._tmp_collector, this);
                    break;
                case 'https':
                    if (collect.output.uri_ins) {
                        await collector_connection.testHttps(collect.output.uri_ins, collect.output);
                    }
                    break;
                case 'testSSL':
                    //if (!collect.output.uri_ins) return testssl_example;
                    if (collect.output.uri_ins) {
                        if (collect.args.testssl_type == 'script') {
                            collector_connection.testSSLScript(
                                collect.output.uri_ins,
                                collect.args,
                                this.logger,
                                collect.output
                            );
                        } else if (collect.args.testssl_type == 'docker') {
                            collector_connection.testSSLDocker(
                                collect.output.uri_ins,
                                collect.args,
                                this.logger,
                                collect.output
                            );
                        } else {
                            collect.output.testSSLError = "Unknow method for testssl, go to settings first.";
                        }

                    } else {
                        collect.output.testSSLError = "No url given to test_ssl.sh";
                    }
                    break;
                case 'localstorage':
                    const localStorage = await getLocalStorage(this._contents, this.logger);
                    await inspect.inspectLocalStorage(localStorage, this._tmp_collector, this);
                    collect.output.localStorage = localStorage;
                    break;

                case 'traffic':
                    collect.output.hosts = {};
                    collect.output.hosts.requests = {};
                    collect.output.hosts.requests.thirdParty = this._traffic_card.inspect();
                    break;

                case 'forms':
                    await collect.collectForms(this._contents);
                    break;

                case 'beacons':

                    collect.output.beacons = this._beacon_card.inspect(eventData);
                    break;
            }
        }


        return collect.output;
    }
}