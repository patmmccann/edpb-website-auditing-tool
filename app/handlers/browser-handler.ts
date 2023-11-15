import { ipcMain, BrowserWindow,BrowserView } from 'electron';
import {BrowserSession} from './sessions/browser-session'

export class BrowsersHandlher {
    mainWindow : BrowserWindow;
    new_default_collector :BrowserSession | null= null;
    new_collectors :BrowserSession[][] = [];
    currentView :BrowserView= null;

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
        ipcMain.handle('toogleDevTool', this.toogleDevTool.bind(this));
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
        ipcMain.removeHandler('toogleDevTool');
    }

    get(analysis_id : number, tag_id:number) {
        if (!analysis_id && !tag_id) {
            return this.new_default_collector;
        }
    
        const analysis = this.new_collectors[analysis_id];
        if (!analysis) return null;
        return this.new_collectors[analysis_id][tag_id];
    }

    hideSession(){
        this.mainWindow.setBrowserView(null);
    }

    showSession(event, analysis_id, tag_id){
        const browserSession = this.get(analysis_id, tag_id);
        this.currentView = browserSession.view;
        this.mainWindow.setBrowserView(browserSession.view);
        return browserSession.url;
    }

    resizeSession(event, rect){
        if (rect) {
            this.currentView.setBounds({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
        }
    }

    getUrl(event, analysis_id, tag_id){
        const session = this.get(analysis_id, tag_id);
        return session.url;
    }

    async loadURL(event, analysis_id, tag_id, url){
        const session = this.get(analysis_id, tag_id);
        await session.gotoPage(url);
        return session.url;
    }

    refresh(event, analysis_id, tag_id) {
        const session = this.get(analysis_id, tag_id);
        session.reload();
    }

    stop (event, analysis_id, tag_id) {
        const session = this.get(analysis_id, tag_id);
        session.stop();
    }

    backward (event, analysis_id, tag_id) {
        const session = this.get(analysis_id, tag_id);
        session.goBack();
    }

    forward (event, analysis_id, tag_id) {
        const session = this.get(analysis_id, tag_id);
        session.goForward();
    }

    canGoBackward (event, analysis_id, tag_id) {
        const session = this.get(analysis_id, tag_id);
        return session.canGoBack();
    }

    canGoForward (event, analysis_id, tag_id) {
        const session = this.get(analysis_id, tag_id);
        return session.canGoForward();
    }

    async screenshot(event, analysis_id, tag_id){
        const session = this.get(analysis_id, tag_id);
        return await session.screenshot();
    }

    toogleDevTool(event, analysis_id, tag_id){
        const session = this.get(analysis_id, tag_id);
        session.toogleDevTool();
    }

    async createBrowserSession(event, analysis_id, tag_id, url, args){
        if (analysis_id && tag_id) {
            const browserSession = new BrowserSession();
            const collect = await browserSession.create(this.mainWindow, 'session' + analysis_id + tag_id, args);

            if (url) {
                await collect.getPage(url);
            }

            if (!(analysis_id in this.new_collectors)) {
                this.new_collectors[analysis_id] = [];
            }

            this.new_collectors[analysis_id][tag_id] = browserSession;
        } else if (this.new_default_collector == null) {
            const browserSession = new BrowserSession();
            const collect = await browserSession.create(this.mainWindow, 'main', args);
            this.new_default_collector = browserSession;
        }
    }

    async deleteBrowserSession(event, analysis_id, tag_id){
        const new_collector = this.get(analysis_id, tag_id);
        if (!new_collector) return;

        const current_view = this.mainWindow.getBrowserView();

        if (new_collector.view == current_view) {
            this.mainWindow.setBrowserView(null);
        }

        await new_collector.delete();
        if (this.new_default_collector != new_collector ){
            this.new_collectors[analysis_id][tag_id] = null;
        }
    }

    async clearSession(event, analysis_id, tag_id, args){
        const session = this.get(analysis_id, tag_id);
        await session.clear(args);
    }

    

    async collectFromSession(event, analysis_id, tag_id, kinds, waitForComplete, args){
        const session = this.get(analysis_id, tag_id);
        return await session.collect(kinds, waitForComplete, args);
    }

    async saveSession(event, analysis_id, tag_id){
        const session = this.get(analysis_id, tag_id);
        return await session.save();
    }
}
