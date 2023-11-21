import { app, BrowserView, WebContents, ipcMain, BrowserWindow } from 'electron';
import { CollectorSession } from './collector-session';

const collector = require("../../../collector/index");
const logger = require("../../../lib/logger");
const inspector = require("../../../inspector/index");

const collector_connection = require("../../../collector/connection");
const { setup_cookie_recording, report_event_logger } = require("../../../lib/setup-cookie-recording");
const { setup_beacon_recording } = require("../../../lib/setup-beacon-recording");
const {
    isFirstParty,
    getLocalStorage,
    safeJSONParse,
} = require("../../../lib/tools");

const {
    setup_websocket_recording,
} = require("../../../lib/setup-websocket-recording");

import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import * as lodash from 'lodash';

export class BrowserSession {
    _url = "";
    _view: BrowserView;
    _contents: WebContents;
    _collector: CollectorSession;
    _tmp_collector: any;
    _session_name :string;
    _mainWindow : BrowserWindow;

    constructor(mainWindow : BrowserWindow) {
        this._collector = new CollectorSession();
        this._mainWindow = mainWindow;
    }

    createBrowserSession(args) {

        this._view = new BrowserView({
            webPreferences: {
                preload: path.join(__dirname, '../../../collector/preload.js'),
                contextIsolation: false,
                partition: this._session_name
            }
        });

        this._contents =  this._view.webContents;

        this._view.webContents.send('init', this._session_name);

        if (args.useragent) {
            this._view.webContents.setUserAgent(args.useragent);
        }

        this._tmp_collector.refs_regexp = null;

        this._view.webContents.on('did-start-loading', () => {
            this._mainWindow.webContents.send('browser-event', 'did-start-loading', this._session_name);
        });

        this._view.webContents.on('dom-ready', async () => {
            //await browser.webContents.executeJavaScript(stackTraceHelper);
            this._view.webContents.send('init', this._session_name);
        });


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
    }

    // go to page, start har etc
    async start(args) {

        if (args.dnt) {
            this._view.webContents.session.webRequest.onBeforeSendHeaders(
                (details, callback) => {
                    details.requestHeaders['DNT'] = '1';
                    callback({ requestHeaders: details.requestHeaders });
                });               
        }

        if (args.dntJs) {
            this._view.webContents.send('dntJs');
        }

        ipcMain.handle('reportEvent' + this._session_name, async (reportEvent, type, stack, data, location) => {
            report_event_logger(this.logger, type, stack, data, JSON.parse(location));
        });



        // forward logs from the browser console
        this._view.webContents.on("console-message", (event, level, msg, line, sourceId) =>
        this.logger.log("debug", msg, { type: "Browser.Console" })
        );

        // forward logs from each requests browser console
        this._view.webContents.session.webRequest.onBeforeRequest(async (details, callback) => {
            // record all requested hosts
            const l = url.parse(details.url);
            // note that hosts may appear as first and third party depending on the path
            if (isFirstParty(this._tmp_collector.refs_regexp, l)) {
                this._collector.hosts.requests.firstParty.add(l.hostname);
            } else {
                if (l.protocol != "data:") {
                    this._collector.hosts.requests.thirdParty.add(l.hostname);
                }
            }

            await setup_beacon_recording(details, this.logger);
            callback({});
        });

        // setup tracking
        this._view.webContents.session.webRequest.onHeadersReceived(async (details, callback) => {
            await setup_cookie_recording(details, this._view.webContents.mainFrame.url, this.logger);
            callback({});
        });
    }

    async create(session_name, args) {
        const collect = await collector(args, logger.create({}, args));
        this._tmp_collector = collect;
        this._session_name= session_name;
        //await collect.createSession(mainWindow, session_name);
        this.createBrowserSession(args);
        await this.start(args);
        return collect;
    }

    async delete() {
        this._contents.session.webRequest.onBeforeRequest(null, null);
        this._contents.session.webRequest.onHeadersReceived(null, null);
        (this._contents as any).destroy();
        ipcMain.removeHandler('reportEvent' + this._session_name);
        await this._tmp_collector.endSession();
    }

    async clear(args) {
        await this._tmp_collector.eraseSession(args, logger.create({}, args));
        await this._contents.session.clearCache();
        await this._contents.session.clearStorageData();
        this._tmp_collector.uri_ins = this._contents.getURL();
    }

    async gotoPage(url) {
        this.logger.log("info", `browsing now to ${url}`, { type: "Browser" });

        try {
            await this._contents.loadURL(url);
        } catch (error) {
            this.logger.log("error", error.message, { type: "Browser" });
        }
    }

    canGoForward() {
        return this._contents.canGoForward();
    }

    canGoBack() {
        return this._contents.canGoBack();
    }

    goBack() {
        this._contents.goBack();
    }

    goForward() {
        this._contents.goForward();
    }

    stop() {
        this._contents.stop();
    }

    reload() {
        this._contents.reload();
    }

    get url() {
        return this._contents.getURL();
    }

    async screenshot() {
        const capture = await this._contents.capturePage();
        return await capture.toPNG();
    }

    toogleDevTool() {
        this._contents.toggleDevTools();
    }

    async collect(kinds, waitForComplete, args) {
        const collect = this._tmp_collector;

        if (waitForComplete) {
            await logger.waitForComplete(this.logger);
        }

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
                    await inspect.inspectCookies(this._tmp_collector, this._collector);
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
                    await inspect.inspectLocalStorage(localStorage, this._tmp_collector, this._collector);
                    collect.output.localStorage = localStorage;
                    break;

                case 'traffic':
                    await inspect.inspectHosts(this._collector);
                    break;

                case 'forms':
                    await collect.collectForms(this._contents);
                    break;

                case 'beacons':
                    await inspect.inspectBeacons(this._collector, this._tmp_collector);
                    break;
            }
        }


        return collect.output;
    }

    async save() {
        const collect = this._tmp_collector;

        //test the ssl and https connection
        await collect.testConnection();

        // ########################################################
        // Collect Links, Forms and Cookies to populate the output
        // ########################################################
        await collect.collectLinks();
        await collect.collectForms();
        await collect.collectCookies();
        await collect.collectLocalStorage();
        await collect.collectWebsocketLog();

        // browse sample history and log to localstorage
        let browse_user_set: any[] = /*args.browseLink ||*/[]; //FIXME
        await collect.browseSamples(collect.output.localStorage, browse_user_set);

        // END OF BROWSING - discard the browser and page
        //mainWindow.setBrowserView(null);
        //await collect.endSession();

        await logger.waitForComplete(this.logger);

        // ########################################################
        //  inspecting - this will process the collected data and place it in a structured format in the output object
        // ########################################################

        const inspect = await inspector(
            null, //args, FIXME
            this.logger,
            collect.pageSession,
            collect.output
        );

        await inspect.inspectCookies();
        await inspect.inspectLocalStorage();
        await inspect.inspectBeacons();
        await inspect.inspectHosts();

        return collect.output;
    }

    get view() {
        return this._view;
    }

    get contents() {
        return this._contents;
    }

    get collector() {
        return this._collector;
    }

    get tmp_collector() {
        return this._tmp_collector;
    }

    get user_agent() {
        return this._contents.getUserAgent();
    }

    get version() {
        return app.getVersion();
    }
    
    get logger(){
        return this.collector.logger;
    }
}