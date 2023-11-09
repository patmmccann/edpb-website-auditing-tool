import { ipcMain, BrowserWindow } from 'electron';

const collector = require("../collector/index");
const inspector = require("../inspector/index");

const logger = require("../lib/logger");
const pug = require("pug");
const path = require("path");
const groupBy = require("lodash/groupBy");
const fs = require("fs-extra");
const collector_connection = require("../collector/connection");
import { print_to_pdf, print_to_docx } from "./export_report";

let mainWindow = null;
let default_collector :any= null;
let collectors :any = {};
let browserWindow :any= null;

function getCollector(analysis_id : number, tag_id:number) {
    if (!analysis_id && !tag_id) {
        return default_collector;
    }

    const analysis = collectors[analysis_id];
    if (!analysis) return null;
    return collectors[analysis_id][tag_id];
}

export class BrowsersHandlher {
    mainWindow : BrowserWindow;

    constructor(mainWindow : BrowserWindow){
        this.mainWindow = mainWindow;
        ipcMain.handle('resizeSession',this.resizeSession);
        ipcMain.handle('hideSession', this.hideSession);
        ipcMain.handle('showSession', this.showSession);
        ipcMain.handle('getURL',this.getUrl);
        ipcMain.handle('loadURL', this.loadURL);
        ipcMain.handle('refresh', this.refresh);
        ipcMain.handle('stop',this.stop);
        ipcMain.handle('backward',this.backward);
        ipcMain.handle('forward',this.forward);
        ipcMain.handle('canGoBackward',this.canGoBackward);
        ipcMain.handle('canGoForward',this.canGoForward);
        ipcMain.handle('createCollector', this.createBrowserSession);
        ipcMain.handle('deleteCollector', this.deleteBrowserSession);
        ipcMain.handle('eraseSession', this.clearSession);
        ipcMain.handle('save', this.saveSession);
        ipcMain.handle('get', this.collectFromSession);
    }

    hideSession(){
        mainWindow.setBrowserView(null);
    }

    showSession(event, analysis_id, tag_id){
        browserWindow = getCollector(analysis_id, tag_id).browserSession.browser;
        mainWindow.setBrowserView(browserWindow);
        return browserWindow.webContents.getURL();
    }

    resizeSession(event, rect){
        if (rect) {
            browserWindow.setBounds({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
        }
    }

    getUrl(event, analysis_id, tag_id){
        const browserWindow = getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.getURL();
    }

    async loadURL(event, analysis_id, tag_id, url){
        const browserWindow = getCollector(analysis_id, tag_id).browserSession.browser;
        await browserWindow.webContents.loadURL(url);
        return browserWindow.webContents.getURL();
    }

    refresh(event, analysis_id, tag_id) {
        const browserWindow = getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.reload();
    }

    stop (event, analysis_id, tag_id) {
        const browserWindow = getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.stop();
    }

    backward (event, analysis_id, tag_id) {
        const browserWindow = getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.goBack();
    }

    forward (event, analysis_id, tag_id) {
        const browserWindow = getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.goForward();
    }

    canGoBackward (event, analysis_id, tag_id) {
        const browserWindow = getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.canGoBack();
    }

    canGoForward (event, analysis_id, tag_id) {
        const browserWindow = getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.canGoForward();
    }

    async createBrowserSession(event, analysis_id, tag_id, url, args){
        if (analysis_id && tag_id) {
            const collect = await collector(args, logger.create({}, args));
            await collect.createSession(mainWindow, 'session' + analysis_id + tag_id);

            if (url) {
                await collect.getPage(url);
            }

            if (!(analysis_id in collectors)) {
                collectors[analysis_id] = {};
            }

            collectors[analysis_id][tag_id] = collect;
        } else if (default_collector == null) {
            collector(args, logger.create({}, args)).then((collect:any) => {
                default_collector = collect;
                collect.createSession(mainWindow, 'main');
            });
        }
    }

    async deleteBrowserSession(event, analysis_id, tag_id){
        const collector = getCollector(analysis_id, tag_id);
        if (!collector) return;

        const current_view = mainWindow.getBrowserView();

        if (collector.browserSession.browser == current_view) {
            mainWindow.setBrowserView(null);
        }

        await collector.endSession();
        collectors[analysis_id][tag_id] = null;
    }

    clearSession(event, analysis_id, tag_id, args){
        getCollector(analysis_id, tag_id).eraseSession(args, logger.create({}, args));
    }

    async collectFromSession(event, analysis_id, tag_id, kinds, waitForComplete, args){
        let res = null;

        const collect = getCollector(analysis_id, tag_id);

        if (waitForComplete) {
            await logger.waitForComplete(collect.logger);
        }

        if (args){
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
                        if (collect.args.testssl_type == 'script'){
                            collector_connection.testSSLScript(
                                collect.output.uri_ins,
                                collect.args,
                                collect.logger,
                                collect.output
                            );
                        }else if (collect.args.testssl_type == 'docker'){
                            collector_connection.testSSLDocker(
                                collect.output.uri_ins,
                                collect.args,
                                collect.logger,
                                collect.output
                            );
                        }else{
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

    async saveSession(event, analysis_id, tag_id){
        const collect = getCollector(analysis_id, tag_id);

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
        let browse_user_set :any[] = /*args.browseLink ||*/ []; //FIXME
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

    unregisterHandlers(){
        ipcMain.removeHandler('showSession');
        ipcMain.removeHandler('hideSession');
        ipcMain.removeHandler('resizeSession');
        ipcMain.removeHandler('getURL');
        ipcMain.removeHandler('refresh');
        ipcMain.removeHandler('stop');
        ipcMain.removeHandler('backward');
        ipcMain.removeHandler('forward');
        ipcMain.removeHandler('canGoBackward');
        ipcMain.removeHandler('canGoForward');
        ipcMain.removeHandler('createCollector');
        ipcMain.removeHandler('deleteCollector');
        ipcMain.removeHandler('eraseSession');
        ipcMain.removeHandler('save');
        ipcMain.removeHandler('get');
    }
}


export function initBrowserHandlers(win:any) {
    mainWindow = win;

    ipcMain.handle('screenshot', async (event, analysis_id, tag_id) => {
        return await getCollector(analysis_id, tag_id).pageSession.screenshot();
    });

    ipcMain.handle('renderPug', async (event, template, data) => {
        return pug.render(template,
            Object.assign({}, data, {
                pretty: true,
                basedir: path.join(__dirname, "../assets"),
                jsondir: ".", // images in the folder of the inspection.json
                groupBy: groupBy,
                inlineCSS: fs.readFileSync(
                    require.resolve("github-markdown-css/github-markdown.css")
                ),
            })
        );
    });

    ipcMain.handle('parseHar', async (event, har, args) => {
        const collect = await collector(args, logger.create({}, args));
        await collect.createSessionFromHar(har);
        await collect.collectCookies();

        await logger.waitForComplete(collect.logger);

        const inspect = await inspector(
            args,
            collect.logger,
            collect.pageSession,
            collect.output
        );

        await inspect.inspectCookies();
        await inspect.inspectBeacons();
        await inspect.inspectHosts();


        return collect.output;
    });

    ipcMain.handle('export', async (event, format, html) => {
        switch (format) {
            case 'pdf':
                return await print_to_pdf(html);
            case 'docx':
                return await print_to_docx(html);
            default:
                return "";
        }
    });
}

export function deleteBrowserHandlers() {
    ipcMain.removeHandler('screenshot');
    ipcMain.removeHandler('renderPug');
    ipcMain.removeHandler('parseHar');
    ipcMain.removeHandler('export');
};
