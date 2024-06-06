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

    applySettings(settings) {
        this.collector.settings = settings;
        const preloads = [];
        if (settings && settings.logs) {
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
            if (settings && settings.logs) {
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

        if (settings && settings.use_proxy) {
            ses.setProxy({ proxyRules: settings.proxy_settings })
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
                    
                    offscreenRenderer.setContentSize(width> max_size ? max_size : width , height> max_size ? max_size : height);
                    await offscreenRenderer.loadURL(this.url);
                    const screenshot = await offscreenRenderer.webContents.capturePage();
                    const size = screenshot.getSize();
                    return screenshot.toPNG();
                }
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

    get contents() {
        return this.view.webContents;
    }

    get mainWindow() {
        return this._mainWindow;
    }
}