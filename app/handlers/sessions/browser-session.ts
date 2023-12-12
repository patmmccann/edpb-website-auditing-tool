import { app, BrowserView, WebContents, BrowserWindow } from 'electron';
import { CollectorSession } from './collector-session';

import * as path from 'path';

export class BrowserSession {
    _url = "";
    _view: BrowserView;
    _contents: WebContents;
    _collector: CollectorSession;
    _tmp_collector: any;
    _session_name: string;
    _mainWindow: BrowserWindow;

    constructor(mainWindow: BrowserWindow, session_name: string, args) {
        this._collector = new CollectorSession(session_name, args);
        this._mainWindow = mainWindow;
        this._session_name = session_name;
    }

    createBrowserSession(args) {

        this._view = new BrowserView({
            webPreferences: {
                preload: path.join(__dirname, '../../../collector/preload.js'),
                contextIsolation: false,
                partition: this._session_name
            }
        });

        this._contents = this._view.webContents;

        this._contents.send('init', this._session_name);

        if (args.useragent) {
            this._view.webContents.setUserAgent(args.useragent);
        }

        this._view.webContents.on('did-start-loading', () => {
            this._mainWindow.webContents.send('browser-event', 'did-start-loading', this._session_name);
        });

        this._view.webContents.on('dom-ready', async () => {
            //await browser.webContents.executeJavaScript(stackTraceHelper);
            this._view.webContents.send('init', this._session_name);
        });
    }

    // go to page, start har etc
    async start(args) {

        if (args.dnt) {
            this._contents.session.webRequest.onBeforeSendHeaders(
                (details, callback) => {
                    details.requestHeaders['DNT'] = '1';
                    callback({ requestHeaders: details.requestHeaders });
                });
        }

        if (args.dntJs) {
            this._view.webContents.send('dntJs');
        }
    }

    async create(args) {
        this.createBrowserSession(args);
        await this.collector.createCollector(this._mainWindow,this._view, args);        
        await this.start(args);
    }

    delete() {
        this.collector.end();
        (this._contents as any).destroy();
    }

    async clear(args) {
        await this._tmp_collector.eraseSession(args);
        await this._contents.session.clearCache();
        await this._contents.session.clearStorageData();
        this._tmp_collector.uri_ins = this._contents.getURL();
    }

    async gotoPage(url) {
        this.logger.log("info", `browsing now to ${url}`, { type: "Browser" });

        try {
            this._contents.loadURL(url);
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

    async collect(kinds, args) {
        return await this.collector.collect(kinds, args);
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

    get logger() {
        return this.collector.logger;
    }

    get name() {
        return this._session_name;
    }
}