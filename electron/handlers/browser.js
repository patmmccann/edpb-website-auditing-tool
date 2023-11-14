"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowsersHandlher = void 0;
const electron_1 = require("electron");
const collector = require("../../collector/index");
const inspector = require("../../inspector/index");
const logger = require("../../lib/logger");
const collector_connection = require("../../collector/connection");
class BrowsersHandlher {
    constructor(mainWindow) {
        this.default_collector = null;
        this.collectors = {};
        this.browserWindow = null;
        this.mainWindow = mainWindow;
        this.registerHandlers();
    }
    registerHandlers() {
        electron_1.ipcMain.handle('resizeSession', this.resizeSession.bind(this));
        electron_1.ipcMain.handle('hideSession', this.hideSession.bind(this));
        electron_1.ipcMain.handle('showSession', this.showSession.bind(this));
        electron_1.ipcMain.handle('getURL', this.getUrl.bind(this));
        electron_1.ipcMain.handle('loadURL', this.loadURL.bind(this));
        electron_1.ipcMain.handle('refresh', this.refresh.bind(this));
        electron_1.ipcMain.handle('stop', this.stop.bind(this));
        electron_1.ipcMain.handle('backward', this.backward.bind(this));
        electron_1.ipcMain.handle('forward', this.forward.bind(this));
        electron_1.ipcMain.handle('canGoBackward', this.canGoBackward.bind(this));
        electron_1.ipcMain.handle('canGoForward', this.canGoForward.bind(this));
        electron_1.ipcMain.handle('createCollector', this.createBrowserSession.bind(this));
        electron_1.ipcMain.handle('deleteCollector', this.deleteBrowserSession.bind(this));
        electron_1.ipcMain.handle('eraseSession', this.clearSession.bind(this));
        electron_1.ipcMain.handle('save', this.saveSession.bind(this));
        electron_1.ipcMain.handle('get', this.collectFromSession.bind(this));
        electron_1.ipcMain.handle('screenshot', this.screenshot.bind(this));
    }
    unregisterHandlers() {
        electron_1.ipcMain.removeHandler('showSession');
        electron_1.ipcMain.removeHandler('hideSession');
        electron_1.ipcMain.removeHandler('resizeSession');
        electron_1.ipcMain.removeHandler('getURL');
        electron_1.ipcMain.removeHandler('refresh');
        electron_1.ipcMain.removeHandler('stop');
        electron_1.ipcMain.removeHandler('backward');
        electron_1.ipcMain.removeHandler('forward');
        electron_1.ipcMain.removeHandler('canGoBackward');
        electron_1.ipcMain.removeHandler('canGoForward');
        electron_1.ipcMain.removeHandler('createCollector');
        electron_1.ipcMain.removeHandler('deleteCollector');
        electron_1.ipcMain.removeHandler('eraseSession');
        electron_1.ipcMain.removeHandler('save');
        electron_1.ipcMain.removeHandler('get');
        electron_1.ipcMain.removeHandler('screenshot');
    }
    getCollector(analysis_id, tag_id) {
        if (!analysis_id && !tag_id) {
            return this.default_collector;
        }
        const analysis = this.collectors[analysis_id];
        if (!analysis)
            return null;
        return this.collectors[analysis_id][tag_id];
    }
    hideSession() {
        this.mainWindow.setBrowserView(null);
    }
    showSession(event, analysis_id, tag_id) {
        this.browserWindow = this.getCollector(analysis_id, tag_id).browserSession.browser;
        this.mainWindow.setBrowserView(this.browserWindow);
        return this.browserWindow.webContents.getURL();
    }
    resizeSession(event, rect) {
        if (rect) {
            this.browserWindow.setBounds({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
        }
    }
    getUrl(event, analysis_id, tag_id) {
        const browserWindow = this.getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.getURL();
    }
    loadURL(event, analysis_id, tag_id, url) {
        return __awaiter(this, void 0, void 0, function* () {
            const browserWindow = this.getCollector(analysis_id, tag_id).browserSession.browser;
            yield browserWindow.webContents.loadURL(url);
            return browserWindow.webContents.getURL();
        });
    }
    refresh(event, analysis_id, tag_id) {
        const browserWindow = this.getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.reload();
    }
    stop(event, analysis_id, tag_id) {
        const browserWindow = this.getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.stop();
    }
    backward(event, analysis_id, tag_id) {
        const browserWindow = this.getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.goBack();
    }
    forward(event, analysis_id, tag_id) {
        const browserWindow = this.getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.goForward();
    }
    canGoBackward(event, analysis_id, tag_id) {
        const browserWindow = this.getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.canGoBack();
    }
    canGoForward(event, analysis_id, tag_id) {
        const browserWindow = this.getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.canGoForward();
    }
    createBrowserSession(event, analysis_id, tag_id, url, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (analysis_id && tag_id) {
                const collect = yield collector(args, logger.create({}, args));
                yield collect.createSession(this.mainWindow, 'session' + analysis_id + tag_id);
                if (url) {
                    yield collect.getPage(url);
                }
                if (!(analysis_id in this.collectors)) {
                    this.collectors[analysis_id] = {};
                }
                this.collectors[analysis_id][tag_id] = collect;
            }
            else if (this.default_collector == null) {
                collector(args, logger.create({}, args)).then((collect) => {
                    this.default_collector = collect;
                    collect.createSession(this.mainWindow, 'main');
                });
            }
        });
    }
    deleteBrowserSession(event, analysis_id, tag_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const collector = this.getCollector(analysis_id, tag_id);
            if (!collector)
                return;
            const current_view = this.mainWindow.getBrowserView();
            if (collector.browserSession.browser == current_view) {
                this.mainWindow.setBrowserView(null);
            }
            yield collector.endSession();
            this.collectors[analysis_id][tag_id] = null;
        });
    }
    clearSession(event, analysis_id, tag_id, args) {
        this.getCollector(analysis_id, tag_id).eraseSession(args, logger.create({}, args));
    }
    screenshot(event, analysis_id, tag_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getCollector(analysis_id, tag_id).pageSession.screenshot();
        });
    }
    collectFromSession(event, analysis_id, tag_id, kinds, waitForComplete, args) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = null;
            const collect = this.getCollector(analysis_id, tag_id);
            if (waitForComplete) {
                yield logger.waitForComplete(collect.logger);
            }
            if (args) {
                collect.args = args;
            }
            const inspect = yield inspector(collect.args, collect.logger, collect.pageSession, collect.output);
            for (let kind of kinds) {
                switch (kind) {
                    case 'cookie':
                        yield collect.collectCookies();
                        yield inspect.inspectCookies();
                        break;
                    case 'https':
                        if (collect.output.uri_ins) {
                            yield collector_connection.testHttps(collect.output.uri_ins, collect.output);
                        }
                        break;
                    case 'testSSL':
                        //if (!collect.output.uri_ins) return testssl_example;
                        if (collect.output.uri_ins) {
                            if (collect.args.testssl_type == 'script') {
                                collector_connection.testSSLScript(collect.output.uri_ins, collect.args, collect.logger, collect.output);
                            }
                            else if (collect.args.testssl_type == 'docker') {
                                collector_connection.testSSLDocker(collect.output.uri_ins, collect.args, collect.logger, collect.output);
                            }
                            else {
                                collect.output.testSSLError = "Unknow method for testssl, go to settings first.";
                            }
                        }
                        else {
                            collect.output.testSSLError = "No url given to test_ssl.sh";
                        }
                        break;
                    case 'localstorage':
                        yield collect.collectLocalStorage();
                        yield inspect.inspectLocalStorage();
                        break;
                    case 'traffic':
                        yield inspect.inspectHosts();
                        break;
                    case 'forms':
                        yield collect.collectForms();
                        break;
                    case 'beacons':
                        yield inspect.inspectBeacons();
                        break;
                }
            }
            return collect.output;
        });
    }
    saveSession(event, analysis_id, tag_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const collect = this.getCollector(analysis_id, tag_id);
            //test the ssl and https connection
            yield collect.testConnection();
            // ########################################################
            // Collect Links, Forms and Cookies to populate the output
            // ########################################################
            yield collect.collectLinks();
            yield collect.collectForms();
            yield collect.collectCookies();
            yield collect.collectLocalStorage();
            yield collect.collectWebsocketLog();
            // browse sample history and log to localstorage
            let browse_user_set = /*args.browseLink ||*/ []; //FIXME
            yield collect.browseSamples(collect.output.localStorage, browse_user_set);
            // END OF BROWSING - discard the browser and page
            //mainWindow.setBrowserView(null);
            //await collect.endSession();
            yield logger.waitForComplete(collect.logger);
            // ########################################################
            //  inspecting - this will process the collected data and place it in a structured format in the output object
            // ########################################################
            const inspect = yield inspector(null, //args, FIXME
            collect.logger, collect.pageSession, collect.output);
            yield inspect.inspectCookies();
            yield inspect.inspectLocalStorage();
            yield inspect.inspectBeacons();
            yield inspect.inspectHosts();
            return collect.output;
        });
    }
}
exports.BrowsersHandlher = BrowsersHandlher;
