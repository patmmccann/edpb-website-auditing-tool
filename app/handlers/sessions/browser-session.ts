import { app, BrowserView, WebContents} from 'electron';
import {CollectorSession} from './collector-session';

const collector = require("../../../collector/index");
const logger = require("../../../lib/logger");
const inspector = require("../../../inspector/index");
const collector_connection = require("../../../collector/connection");

export class BrowserSession {
    _url = "";
    _view : BrowserView;
    _contents : WebContents;
    _collector : CollectorSession;
    _tmp_collector : any;

    constructor(){
        this._collector = new CollectorSession();
    }

    async create(mainWindow, session_name, args) {
        const collect = await collector(args, logger.create({}, args));
        await collect.createSession(mainWindow, session_name);
        this._view = collect.browserSession.browser; 
        this._contents = collect.browserSession.browser.webContents;
        this._tmp_collector = collect;
        return collect;
    }

    async delete() {
        await this._tmp_collector.endSession();
    }

    async clear(args) {
        await this._tmp_collector.eraseSession(args, logger.create({}, args));
    }

    async gotoPage(url){
        await this._contents.loadURL(url);
    }

    canGoForward(){
        return this._contents.canGoForward();
    }
    
    canGoBack(){
        return this._contents.canGoBack();
    }

    goBack(){
        this._contents.goBack();
    }

    goForward(){
        this._contents.goForward();
    }

    stop(){
        this._contents.stop();
    }

    reload(){
        this._contents.reload();
    }

    get url(){
        return this._contents.getURL();
    }

    async screenshot(){
        const capture = await this._contents.capturePage();
        return await capture.toPNG();
    }

    toogleDevTool(){
        this._contents.toggleDevTools();
    }

    async collect(kinds, waitForComplete, args){
        const collect = this._tmp_collector;

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

    async save(){
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

    get view(){
        return this._view;
    }

    get contents(){
        return this._contents;
    }
    
    get collector(){
        return this._collector;
    }

    get tmp_collector(){
        return this._tmp_collector;
    }

    get user_agent(){
        return this._contents.getUserAgent();
    }

    get version(){
        return app.getVersion();
    }
}