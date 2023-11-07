const { ipcMain } = require('electron');

const collector = require("../collector/index");
const inspector = require("../inspector/index");

const logger = require("../lib/logger");
const pug = require("pug");
const path = require("path");
const groupBy = require("lodash/groupBy");
const fs = require("fs-extra");
const collector_connection = require("../collector/connection");
const { print_to_pdf, print_to_docx } = require("./export_report");


function initBrowserHandlers(win) {
    let mainWindow = win;
    let browserWindow = null;
    let default_collector = null;
    let collectors = {};

    function getCollector(analysis_id, tag_id) {
        if (!analysis_id && !tag_id) {
            return default_collector;
        }

        const analysis = collectors[analysis_id];
        if (!analysis) return null;
        return collectors[analysis_id][tag_id];
    }


    ipcMain.handle('createCollector', async (event, analysis_id, tag_id, url, args) => {

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
            collector(args, logger.create({}, args)).then(collect => {
                default_collector = collect;
                collect.createSession(mainWindow, 'main');
            });
        }

    });

    ipcMain.handle('deleteCollector', async (event, analysis_id, tag_id) => {
        const collector = getCollector(analysis_id, tag_id);
        if (!collector) return;

        const current_view = mainWindow.getBrowserView();

        if (collector.browserSession.browser == current_view) {
            mainWindow.setBrowserView(null);
        }

        // END OF BROWSING - discard the browser and page
        await collector.endSession();
        collectors[analysis_id][tag_id] = null;
        return;
    });

    ipcMain.handle('eraseSession', async (event, analysis_id, tag_id, args) => {
        await getCollector(analysis_id, tag_id).eraseSession(args, logger.create({}, args))
    });

    ipcMain.handle('showSession', async (event, analysis_id, tag_id) => {
        browserWindow = getCollector(analysis_id, tag_id).browserSession.browser;
        mainWindow.setBrowserView(browserWindow);
        return browserWindow.webContents.getURL();
    });

    ipcMain.handle('getSessions', async (event) => {
        const sessions = [];
        for (const [analysis, sessions] of Object.entries(collectors)) {
            for (const [tag, session] of Object.entries(sessions)) {
                sessions.push({ analysis: analysis, tag: tag })
            }
        }

        return sessions;
    });

    ipcMain.handle('hideSession', async (event) => {
        browserWindow = null;
        mainWindow.setBrowserView(null);
    });

    ipcMain.handle('resizeSession', async (event, rect) => {
        if (rect) {
            browserWindow.setBounds({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
        }
    });

    ipcMain.handle('loadURL', async (event, analysis_id, tag_id, url) => {
        const browserWindow = getCollector(analysis_id, tag_id).browserSession.browser;
        await browserWindow.webContents.loadURL(url);
        return browserWindow.webContents.getURL();
    });


    ipcMain.handle('getURL', async (event, analysis_id, tag_id) => {
        const browserWindow = getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.getURL();
    });

    ipcMain.handle('stop', async (event, analysis_id, tag_id) => {
        const browserWindow = getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.stop();
    });

    ipcMain.handle('backward', async (event, analysis_id, tag_id) => {
        const browserWindow = getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.goBack();
    });

    ipcMain.handle('forward', async (event, analysis_id, tag_id) => {
        const browserWindow = getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.goForward();
    });

    ipcMain.handle('canGoBackward', async (event, analysis_id, tag_id) => {
        const browserWindow = getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.canGoBack();
    });

    ipcMain.handle('canGoForward', async (event, analysis_id, tag_id) => {
        const browserWindow = getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.canGoForward();
    });


    ipcMain.handle('refresh', async (event, analysis_id, tag_id) => {
        const browserWindow = getCollector(analysis_id, tag_id).browserSession.browser;
        return browserWindow.webContents.reload();
    });

    ipcMain.handle('save', async (event, analysis_id, tag_id) => {
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
        let browse_user_set = args.browseLink || [];
        await collect.browseSamples(collect.output.localStorage, browse_user_set);

        // END OF BROWSING - discard the browser and page
        //mainWindow.setBrowserView(null);
        //await collect.endSession();

        await logger.waitForComplete(collect.logger);

        // ########################################################
        //  inspecting - this will process the collected data and place it in a structured format in the output object
        // ########################################################

        const inspect = await inspector(
            args,
            collect.logger,
            collect.pageSession,
            collect.output
        );

        await inspect.inspectCookies();
        await inspect.inspectLocalStorage();
        await inspect.inspectBeacons();
        await inspect.inspectHosts();

        return collect.output;
    });

    ipcMain.handle('get', async (event, analysis_id, tag_id, kinds, waitForComplete, args) => {

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
    });

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

function deleteBrowserHandlers() {
    ipcMain.removeHandler('createCollector');
    ipcMain.removeHandler('deleteCollector');
    ipcMain.removeHandler('eraseSession');
    ipcMain.removeHandler('showSession');
    ipcMain.removeHandler('getSessions');
    ipcMain.removeHandler('hideSession');
    ipcMain.removeHandler('resizeSession');
    ipcMain.removeHandler('loadURL');
    ipcMain.removeHandler('getURL');
    ipcMain.removeHandler('stop');
    ipcMain.removeHandler('backward');
    ipcMain.removeHandler('forward');
    ipcMain.removeHandler('canGoBackward');
    ipcMain.removeHandler('canGoForward');
    ipcMain.removeHandler('refresh');
    ipcMain.removeHandler('save');
    ipcMain.removeHandler('get');
    ipcMain.removeHandler('screenshot');
    ipcMain.removeHandler('renderPug');
    ipcMain.removeHandler('parseHar');
    ipcMain.removeHandler('export');
};

module.exports = {initBrowserHandlers, deleteBrowserHandlers};