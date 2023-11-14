import { ipcMain, BrowserWindow } from 'electron';

const collector = require("../../collector/index");
const inspector = require("../../inspector/index");

const logger = require("../../lib/logger");

const collector_connection = require("../../collector/connection");

export class BrowsersHandlher {
    mainWindow : BrowserWindow;
    default_collector :any= null;
    collectors :any = {};
    browserWindow :any= null;

    constructor(mainWindow : BrowserWindow){
        this.mainWindow = mainWindow;
        this.registerHandlers();
    }

    registerHandlers(){
        ipcMain.handle('resizeSession',this.resizeSession.bind(this));
        ipcMain.handle('hideSession', this.hideSession.bind(this));
        ipcMain.handle('showSession', this.showSession.bind(this));
        ipcMain.handle('getURL',this.getUrl.bind(this));
        ipcMain.handle('loadURL', this.loadURL.bind(this));
        ipcMain.handle('refresh', this.refresh.bind(this));
        ipcMain.handle('stop',this.stop.bind(this));
        ipcMain.handle('backward',this.backward.bind(this));
        ipcMain.handle('forward',this.forward.bind(this));
        ipcMain.handle('canGoBackward',this.canGoBackward.bind(this));
        ipcMain.handle('canGoForward',this.canGoForward.bind(this));
        ipcMain.handle('createCollector', this.createBrowserSession.bind(this));
        ipcMain.handle('deleteCollector', this.deleteBrowserSession.bind(this));
        ipcMain.handle('eraseSession', this.clearSession.bind(this));
        ipcMain.handle('save', this.saveSession.bind(this));
        ipcMain.handle('get', this.collectFromSession.bind(this));
        ipcMain.handle('screenshot', this.screenshot.bind(this));
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
        ipcMain.removeHandler('screenshot');
    }

    getCollector(analysis_id : number, tag_id:number) {
        if (!analysis_id && !tag_id) {
            return this.default_collector;
        }
    
        const analysis = this.collectors[analysis_id];
        if (!analysis) return null;
        return this.collectors[analysis_id][tag_id];
    }

    hideSession(){
        this.mainWindow.setBrowserView(null);
    }

    showSession(event, analysis_id, tag_id){
        this.browserWindow = this.getCollector(analysis_id, tag_id).browserSession.browser;
        this.mainWindow.setBrowserView(this.browserWindow);
        return this.browserWindow.webContents.getURL();
    }

    resizeSession(event, rect){
        if (rect) {
            this.browserWindow.setBounds({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
        }
    }

    getUrl(event, analysis_id, tag_id){
        const browserWindow = this.getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.getURL();
    }

    async loadURL(event, analysis_id, tag_id, url){
        const browserWindow = this.getCollector(analysis_id, tag_id).browserSession.browser;
        await browserWindow.webContents.loadURL(url);
        return browserWindow.webContents.getURL();
    }

    refresh(event, analysis_id, tag_id) {
        const browserWindow = this.getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.reload();
    }

    stop (event, analysis_id, tag_id) {
        const browserWindow = this.getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.stop();
    }

    backward (event, analysis_id, tag_id) {
        const browserWindow = this.getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.goBack();
    }

    forward (event, analysis_id, tag_id) {
        const browserWindow = this.getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.goForward();
    }

    canGoBackward (event, analysis_id, tag_id) {
        const browserWindow = this.getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.canGoBack();
    }

    canGoForward (event, analysis_id, tag_id) {
        const browserWindow = this.getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.canGoForward();
    }

    async createBrowserSession(event, analysis_id, tag_id, url, args){
        if (analysis_id && tag_id) {
            const collect = await collector(args, logger.create({}, args));
            await collect.createSession(this.mainWindow, 'session' + analysis_id + tag_id);

            if (url) {
                await collect.getPage(url);
            }

            if (!(analysis_id in this.collectors)) {
                this.collectors[analysis_id] = {};
            }

            this.collectors[analysis_id][tag_id] = collect;
        } else if (this.default_collector == null) {
            collector(args, logger.create({}, args)).then((collect:any) => {
                this.default_collector = collect;
                collect.createSession(this.mainWindow, 'main');
            });
        }
    }

    async deleteBrowserSession(event, analysis_id, tag_id){
        const collector = this.getCollector(analysis_id, tag_id);
        if (!collector) return;

        const current_view = this.mainWindow.getBrowserView();

        if (collector.browserSession.browser == current_view) {
            this.mainWindow.setBrowserView(null);
        }

        await collector.endSession();
        this.collectors[analysis_id][tag_id] = null;
    }

    clearSession(event, analysis_id, tag_id, args){
        this.getCollector(analysis_id, tag_id).eraseSession(args, logger.create({}, args));
    }

    async screenshot(event, analysis_id, tag_id){
        return await this.getCollector(analysis_id, tag_id).pageSession.screenshot();
    }

    async collectFromSession(event, analysis_id, tag_id, kinds, waitForComplete, args){
        let res = null;

        const collect = this.getCollector(analysis_id, tag_id);

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
        const collect = this.getCollector(analysis_id, tag_id);

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
}
