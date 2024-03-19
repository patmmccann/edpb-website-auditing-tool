/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { app, BrowserView, BrowserWindow, ipcMain } from 'electron';
import { BrowserCollector } from '../collectors/browser-collector';

import * as path from 'path';

export class BrowserSession {
    _view: BrowserView;
    _collector: BrowserCollector;
    _session_name: string;
    _mainWindow: BrowserWindow;

    constructor(mainWindow: BrowserWindow, session_name: string, settings) {
        this._collector = new BrowserCollector(session_name, settings);
        this._mainWindow = mainWindow;
        this._session_name = session_name;

        this._view = new BrowserView({
            webPreferences: {
                contextIsolation: false,
                partition: this._session_name
            }
        });
        
        this.applySettings(settings);

        this.view.webContents.on('did-start-loading', () => {
            this._mainWindow.webContents.send('browser-event', 'did-start-loading', this._session_name);
        });

        this.view.webContents.on('did-finish-load', () => {
            this._mainWindow.webContents.send('browser-event', 'did-finish-load', this._session_name);
        });

        this.view.webContents.session.webRequest.onBeforeRequest(async (details, callback) => {
            this.collector.onBeforeRequestCallbacks.forEach(fn => fn(details));
            callback({});
        });

        this.view.webContents.session.webRequest.onHeadersReceived(async (details, callback) => {
            this.collector.onHeadersReceivedCallbacks.forEach(fn => fn(details));
            callback({});
        });
    }

    applySettings(settings){
        this.collector.settings = settings;
        const preloads = [];
        if (settings && settings.logs){
            //Set preloads
            const stacktracePath = path.dirname(require.resolve("stacktrace-js/package.json"));
            preloads.push(path.join(__dirname, 'preload.js'));
            preloads.push(path.join(stacktracePath, '/dist/stacktrace.min.js'));
        }
        const htmlToImagePath = path.dirname(require.resolve("html2canvas/package.json"));
        preloads.push(path.join(htmlToImagePath, '/dist/html2canvas.min.js'));

        const ses = this._view.webContents.session;
        ses.setPreloads(preloads);

        this.contents.send('init', this._session_name);

        if (settings && settings.useragent) {
            this.view.webContents.setUserAgent(settings.useragent);
        }

        this.view.webContents.on('dom-ready', async () => {
            if (settings && settings.logs){
                this.contents.send('init', this._session_name);
            }
            this.collector.domReadyCallbacks.forEach(fn => fn());
        });

        if (settings && settings.dnt) {
            this.contents.session.webRequest.onBeforeSendHeaders(
                (details, callback) => {
                    details.requestHeaders['DNT'] = '1';
                    callback({ requestHeaders: details.requestHeaders });
                });
        }

        if (settings && settings.dntJs) {
            this._view.webContents.send('dntJs');
        }
    }

    async create() {
        await this.collector.createCollector(this._view);
    }

    delete() {
        this.collector.end();
        (this.contents as any).destroy();
    }

    async clear() {
        await this.contents.session.clearCache();
        await this.contents.session.clearStorageData();
        await this.collector.clear();
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

    async screenshot(full_screenshot) {
        if (full_screenshot){
            return new Promise((resolve) => {
                ipcMain.removeHandler('full_screenshot_image');
                ipcMain.handleOnce('full_screenshot_image', ((event, img)=>{
                    resolve(img);
                }));
                this.contents.send('full_screenshot');
            });
        }else{
            const capture = await this.contents.capturePage();
            return await capture.toPNG();
        }
    }

    toogleDevTool() {
        this.contents.toggleDevTools();
    }

    async collect(kinds) {
        return await this.collector.collect(kinds);
    }

    async launch(kinds) {
        return await this.collector.launch(kinds);
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