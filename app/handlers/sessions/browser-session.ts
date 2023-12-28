import { app, BrowserView, BrowserWindow } from 'electron';
import { BrowserCollector } from '../collectors/browser-collector';

import * as path from 'path';

export class BrowserSession {
    _view: BrowserView;
    _collector: BrowserCollector;
    _session_name: string;
    _mainWindow: BrowserWindow;

    constructor(mainWindow: BrowserWindow, session_name: string, args) {
        this._collector = new BrowserCollector(session_name, args);
        this._mainWindow = mainWindow;
        this._session_name = session_name;

        this._view = new BrowserView({
            webPreferences: {
                preload: path.join(__dirname, '../../../collector/preload.js'),
                contextIsolation: false,
                partition: this._session_name
            }
        });

        this.contents.send('init', this._session_name);

        if (args && args.useragent) {
            this.view.webContents.setUserAgent(args.useragent);
        }

        this.view.webContents.on('did-start-loading', () => {
            this._mainWindow.webContents.send('browser-event', 'did-start-loading', this._session_name);
        });

        this.view.webContents.on('did-finish-load', () => {
            this._mainWindow.webContents.send('browser-event', 'did-finish-load', this._session_name);
        });

        this.view.webContents.on('dom-ready', async () => {
            //await browser.webContents.executeJavaScript(stackTraceHelper);
            this.contents.send('init', this._session_name);
        });

        if (args && args.dnt) {
            this.contents.session.webRequest.onBeforeSendHeaders(
                (details, callback) => {
                    details.requestHeaders['DNT'] = '1';
                    callback({ requestHeaders: details.requestHeaders });
                });
        }

        if (args && args.dntJs) {
            this._view.webContents.send('dntJs');
        }
    }

    async create(args) {
        await this.collector.createCollector(this._view, args);
    }

    delete() {
        this.collector.end();
        (this.contents as any).destroy();
    }

    async clear(args) {
        await this.contents.session.clearCache();
        await this.contents.session.clearStorageData();
        await this.collector.clear(args);
    }

    async gotoPage(url) {
        if (this.logger.writable == false) return;
        this.logger.log("info", `browsing now to ${url}`, { type: "Browser" });

        try {
            this.contents.loadURL(url);
        } catch (error) {
            this.logger.log("error", error.message, { type: "Browser" });
        }
    }

    canGoForward() {
        return this.contents.canGoForward();
    }

    canGoBack() {
        return this.contents.canGoBack();
    }

    goBack() {
        this.contents.goBack();
    }

    goForward() {
        this.contents.goForward();
    }

    stop() {
        this.contents.stop();
    }

    reload() {
        this.contents.reload();
    }

    get url() {
        return this.contents.getURL();
    }

    async screenshot() {
        const capture = await this.contents.capturePage();
        return await capture.toPNG();
    }

    toogleDevTool() {
        this.contents.toggleDevTools();
    }

    async collect(kinds, args) {
        return await this.collector.collect(kinds, args);
    }

    get view() {
        return this._view;
    }

    get collector() {
        return this._collector;
    }

    get user_agent() {
        return this.contents.getUserAgent();
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

    get contents(){
        return this.view.webContents;
    }

    get mainWindow(){
        return this._mainWindow;
    }
}