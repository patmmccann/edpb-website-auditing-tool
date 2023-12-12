
import { BrowserView, BrowserWindow, WebContents, ipcMain } from 'electron';
const collector_connection = require("../../../collector/connection");

import { Logger, createLogger, format, transports } from 'winston'

const collector = require("../../../collector/index");
const inspector = require("../../../inspector/index");

const { setup_cookie_recording, report_event_logger } = require("../../../lib/setup-cookie-recording");
const { setup_beacon_recording } = require("../../../lib/setup-beacon-recording");

const {
    isFirstParty,
    getLocalStorage,
    safeJSONParse,
} = require("../../../lib/tools");

import * as lodash from 'lodash';
import * as url from 'url';
import * as tmp from 'tmp';

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
    _mainWindow: BrowserWindow;

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

    async createCollector(mainWindow: BrowserWindow, view:BrowserView, args) {
        this._view = view;
        this._contents = view.webContents; 
        this._mainWindow = mainWindow;

        const collect = await collector(args);
        this._tmp_collector = collect;

        this._tmp_collector.refs_regexp = null;

        this._view.webContents.on('did-finish-load', () => {
            // configuring url and hosts
            this._tmp_collector.output.uri_ins = this._view.webContents.getURL();
            this._tmp_collector.output.uri_ins_host = url.parse(this._tmp_collector.output.uri_ins).hostname; // hostname does not include port unlike host
            this._tmp_collector.output.uri_refs.push(this._tmp_collector.output.uri_ins);

            // create url map and regex - urls.js ?
            let uri_refs_stripped = this._tmp_collector.output.uri_refs.map((uri_ref) => {
                let uri_ref_parsed = url.parse(uri_ref);
                return lodash.escapeRegExp(
                    `${uri_ref_parsed.hostname}${uri_ref_parsed.pathname.replace(
                        /\/$/,
                        ""
                    )}`
                );
            });

            this._tmp_collector.refs_regexp = new RegExp(`^(${uri_refs_stripped.join("|")})\\b`, "i");
            this._mainWindow.webContents.send('browser-event', 'did-finish-load', this._session_name);
        });


        ipcMain.handle('reportEvent' + this._session_name, async (reportEvent, type, stack, data, location) => {
            report_event_logger(this.logger, type, stack, data, JSON.parse(location));
        });



        // forward logs from the browser console
        this._contents.on("console-message", (event, level, msg, line, sourceId) =>
            this.logger.log("debug", msg, { type: "Browser.Console" })
        );

        // forward logs from each requests browser console
        this._contents.session.webRequest.onBeforeRequest(async (details, callback) => {
            // record all requested hosts
            const l = url.parse(details.url);
            // note that hosts may appear as first and third party depending on the path
            if (isFirstParty(this._tmp_collector.refs_regexp, l)) {
                this.hosts.requests.firstParty.add(l.hostname);
            } else {
                if (l.protocol != "data:") {
                    this.hosts.requests.thirdParty.add(l.hostname);
                }
            }

            await setup_beacon_recording(details, this.logger);
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

    async collect(kinds, args) {
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
                    await inspect.inspectHosts(this);
                    break;

                case 'forms':
                    await collect.collectForms(this._contents);
                    break;

                case 'beacons':
                    await inspect.inspectBeacons(this, this._tmp_collector);
                    break;
            }
        }


        return collect.output;
    }
}