import { app, BrowserView, WebContents, ipcMain } from 'electron';
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

    constructor() {
        this._collector = new CollectorSession();
    }

    createBrowserSession(mainWindow, partition, collector, args) {

        let browser = new BrowserView({
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: false,
                partition: partition
            }
        });

        //browser.webContents.executeJavaScript(stackTraceHelper);
        browser.webContents.send('init', partition);

        if (args.useragent) {
            browser.webContents.setUserAgent(args.useragent);
        }

        collector.refs_regexp = null;

        browser.webContents.on('did-start-loading', () => {
            mainWindow.webContents.send('browser-event', 'did-start-loading', partition);
        });

        browser.webContents.on('dom-ready', async () => {
            //await browser.webContents.executeJavaScript(stackTraceHelper);
            browser.webContents.send('init', partition);
        });


        browser.webContents.on('did-finish-load', () => {
            // configuring url and hosts
            collector.output.uri_ins = browser.webContents.getURL();
            collector.output.uri_ins_host = url.parse(collector.output.uri_ins).hostname; // hostname does not include port unlike host
            collector.output.uri_refs.push(collector.output.uri_ins);

            // create url map and regex - urls.js ?
            let uri_refs_stripped = collector.output.uri_refs.map((uri_ref) => {
                let uri_ref_parsed = url.parse(uri_ref);
                return lodash.escapeRegExp(
                    `${uri_ref_parsed.hostname}${uri_ref_parsed.pathname.replace(
                        /\/$/,
                        ""
                    )}`
                );
            });

            collector.refs_regexp = new RegExp(`^(${uri_refs_stripped.join("|")})\\b`, "i");
            mainWindow.webContents.send('browser-event', 'did-finish-load', partition);
        });

        // go to page, start har etc
        async function start() {

            if (args.dnt) {
                browser.webContents.session.webRequest.onBeforeSendHeaders(
                    (details, callback) => {
                        details.requestHeaders['DNT'] = '1';
                        callback({ requestHeaders: details.requestHeaders });
                    });               
            }

            if (args.dntJs) {
                browser.webContents.send('dntJs');
            }

            ipcMain.handle('reportEvent' + partition, async (reportEvent, type, stack, data, location) => {
                report_event_logger(collector.logger, type, stack, data, JSON.parse(location));
            });



            // forward logs from the browser console
            browser.webContents.on("console-message", (event, level, msg, line, sourceId) =>
                collector.logger.log("debug", msg, { type: "Browser.Console" })
            );

            /*hosts = {
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
                },*/
            };

            // forward logs from each requests browser console
            browser.webContents.session.webRequest.onBeforeRequest(async (details, callback) => {
                // record all requested hosts
                const l = url.parse(details.url);
                // note that hosts may appear as first and third party depending on the path
                if (isFirstParty(collector.refs_regexp, l)) {
                    collector.pageSession.hosts.requests.firstParty.add(l.hostname);
                } else {
                    if (l.protocol != "data:") {
                        collector.pageSession.hosts.requests.thirdParty.add(l.hostname);
                    }
                }

                await setup_beacon_recording(details, collector.logger);
                callback({});
            });

            // setup tracking
            browser.webContents.session.webRequest.onHeadersReceived(async (details, callback) => {
                await setup_cookie_recording(details, browser.webContents.mainFrame.url, collector.logger);
                callback({});
            });
    }


    async create(mainWindow, session_name, args) {
        const collect = await collector(args, logger.create({}, args));
        await collect.createSession(mainWindow, session_name);
        this._view = collect.browserSession.browser;
        this._contents = collect.browserSession.browser.webContents;
        this._tmp_collector = collect;
        this._session_name= session_name;
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
    }

    async gotoPage(url) {
        this._tmp_collector.logger.log("info", `browsing now to ${url}`, { type: "Browser" });

        try {
            await this._contents.loadURL(url);
        } catch (error) {
            this._tmp_collector.logger.log("error", error.message, { type: "Browser" });
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
            await logger.waitForComplete(collect.logger);
        }

        if (args) {
            collect.args = args;
        }

        const inspect = await inspector(
            collect.args,
            collect.logger,
            collect.pageSession,
            collect.output
        );

        for (let kind of kinds) {
            switch (kind) {
                case 'cookie':
                    await collect.collectCookies();
                    await inspect.inspectCookies();
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
                                collect.logger,
                                collect.output
                            );
                        } else if (collect.args.testssl_type == 'docker') {
                            collector_connection.testSSLDocker(
                                collect.output.uri_ins,
                                collect.args,
                                collect.logger,
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
                    await collect.collectLocalStorage();
                    await inspect.inspectLocalStorage();
                    break;

                case 'traffic':
                    await inspect.inspectHosts();
                    break;

                case 'forms':
                    await collect.collectForms();
                    break;

                case 'beacons':
                    await inspect.inspectBeacons();
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

        await logger.waitForComplete(collect.logger);

        // ########################################################
        //  inspecting - this will process the collected data and place it in a structured format in the output object
        // ########################################################

        const inspect = await inspector(
            null, //args, FIXME
            collect.logger,
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
}