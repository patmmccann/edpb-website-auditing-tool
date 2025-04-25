/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { app, BrowserWindow, ipcMain, WebContentsView } from 'electron';
import { BrowserCollector } from '../collectors/browser-collector';

import * as path from 'path';

export class BrowserSession {
    _view: WebContentsView;
    _collector: BrowserCollector;
    _session_name: string;
    _mainWindow: BrowserWindow;
    _devtools: BrowserWindow | null;

    constructor(mainWindow: BrowserWindow, session_name: string, settings) {
        this._collector = new BrowserCollector(session_name, settings);
        this._mainWindow = mainWindow;
        this._session_name = session_name;

        this._view = new WebContentsView({
            webPreferences: {
                contextIsolation: false,
                partition: this._session_name
            }
        });

        this.applySettings(settings);
        
        mainWindow.contentView.addChildView(this._view);

        this.view.webContents.on('did-start-loading', () => {
            this._mainWindow.webContents.send('browser-event', 'did-start-loading', this._session_name);
        });

        this.view.webContents.on('did-finish-load', () => {
            this._mainWindow.webContents.send('browser-event', 'did-finish-load', this._session_name);
        });

        this.view.webContents.on('did-navigate', () => {
            this._mainWindow.webContents.send('browser-event', 'did-navigate', this._session_name);
        });

        this.view.webContents.on('did-navigate-in-page', () => {
            this._mainWindow.webContents.send('browser-event', 'did-navigate-in-page', this._session_name);
        });

        this.view.webContents.session.webRequest.onBeforeRequest(async (details, callback) => {
            this.collector.onBeforeRequestCallbacks.forEach(fn => fn(details));
            callback({});
        });

        this.view.webContents.session.webRequest.onHeadersReceived(async (details, callback) => {
            this.collector.onHeadersReceivedCallbacks.forEach(fn => fn(details));
            callback({});
        });

        this.view.webContents.session.webRequest.onSendHeaders(async (details) => {
            this.collector.onSendHeadersCallbacks.forEach(fn => fn(details));
        });
    }

    applySettings(settings) {
        this.collector.settings = settings;
        
        //Set preloads
        const preloads = [];
        if (settings && settings.logs) {
            preloads.push(path.join(__dirname, 'trackers.bundle.js'));
        }
        preloads.push(path.join(__dirname, 'screenshots.bundle.js'));
        preloads.push(path.join(__dirname, 'dnt.bundle.js'));
        
  ;
        const ses = this._view.webContents.session;
        ses.setPreloads(preloads);

        if (settings && settings.useragent) {
            this.view.webContents.setUserAgent(settings.useragent);
        }

        this.view.webContents.on('dom-ready', async () => {
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

        if (settings && settings.use_proxy) {
            ses.setProxy({ proxyRules: settings.proxy_settings })
        }

        if (settings && settings.use_doh) {
            app.configureHostResolver({
                secureDnsMode: 'secure',
                secureDnsServers: [settings.doh]
            })
        }

        if (settings && settings.use_doh && settings.doh != '') {
            try {
                app.configureHostResolver({
                    secureDnsMode: 'secure',
                    secureDnsServers: [settings.doh]
                })
            } catch (e) {
                console.log("Use DoH server : " + e.message);
            }

        }
    }

    async create() {
        await this.collector.createCollector(this._view);
    }

    delete() {
        this.mainWindow.contentView.removeChildView(this.view);
        this.collector.end();
        (this.contents as any).destroy();
    }

    async clear(params : any) {
        if ("cards" in params){
            params["cards"].forEach(card => 
                this.collector.clearCard(card)
            );
        }else{
            await this.contents.session.clearCache();
            await this.contents.session.clearStorageData();
            await this.collector.clear();
        }
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
        return this.contents.navigationHistory.canGoForward();
    }

    canGoBack() {
        return this.contents.navigationHistory.canGoBack();
    }

    goBack() {
        this.contents.navigationHistory.goBack();
    }

    goForward() {
        this.contents.navigationHistory.goForward();
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

    async screenshot(screenshot_option) {
        switch (screenshot_option) {
            case 'visible':
                {
                    const capture = await this.contents.capturePage();
                    const toPNG = await capture.toPNG();
                    return toPNG;
                }
            case 'fullpage_from_dom':
                {
                    return new Promise((resolve) => {
                        ipcMain.removeHandler('full_screenshot_image');
                        ipcMain.handleOnce('full_screenshot_image', ((event, img) => {
                            resolve(img);
                        }));
                        this.contents.send('full_screenshot');
                    });
                }
            case 'fullpage_from_scroll':
                {
                    const { width, height } = await this.contents.executeJavaScript(`
                    new Promise((resolve) => {
                    const width = document.documentElement.scrollWidth;
                    const height = document.documentElement.scrollHeight;
                    resolve({ width, height });
                    });
                `);
                    const captures = [];
                    const captureHeight = this.view.getBounds().height;

                    for (let offset = 0; offset < height; offset += captureHeight) {
                        await this.contents.executeJavaScript(`window.scrollTo(0, ${offset})`);
                        await new Promise(resolve => setTimeout(resolve, 100)); // Attendre le défilement

                        const image = await this.contents.capturePage();
                        const toPng = await image.toPNG();
                        captures.push(toPng);
                    }

                    return captures;
                }
            case 'fullpage_from_url':
                {
                    const max_size = 8000;
                    const { width, height } = await this.contents.executeJavaScript(`
                    new Promise((resolve) => {
                    const width = document.documentElement.scrollWidth;
                    const height = document.documentElement.scrollHeight;
                    resolve({ width, height });
                    });
                `);

                    const offscreenRenderer = new BrowserWindow({
                        enableLargerThanScreen: true,
                        show: false,
                        webPreferences: {
                            offscreen: true
                        }
                    });

                    offscreenRenderer.setContentSize(width > max_size ? max_size : width, height > max_size ? max_size : height);
                    await offscreenRenderer.loadURL(this.url);
                    const screenshot = await offscreenRenderer.webContents.capturePage();
                    const size = screenshot.getSize();
                    offscreenRenderer.close();
                    return screenshot.toPNG();
                }
        }
    }

    set zoomFactor(factor: number) {
        this.contents.setZoomFactor(factor);
    }

    get zoomFactor() {
        return this.contents.getZoomFactor();
    }

    toogleDevTool() {
        if (this._devtools == null) {
            this._devtools = new BrowserWindow();
            this.contents.setDevToolsWebContents(this._devtools.webContents);
            this.contents.openDevTools({ mode: 'detach' })
        } else {
            this._devtools.close();
            this._devtools = null;
            this.contents.closeDevTools();
        }

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

    get contents() {
        return this.view.webContents;
    }

    get mainWindow() {
        return this._mainWindow;
    }

    hide(){
        this.view.setVisible(false);
    }

    show(){
        this.view.setVisible(true);
    }
}