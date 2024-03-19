/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { ipcMain, BrowserWindow, BrowserView } from 'electron';
import { BrowserSession } from './sessions/browser-session'

export class BrowsersHandler {
    _mainWindow: BrowserWindow;
    _sessions: BrowserSession[] = [];
    currentView: BrowserView | null = null;

    constructor(mainWindow: BrowserWindow) {
        this._mainWindow = mainWindow;
        this.registerHandlers();
    }

    registerHandlers() {
        ipcMain.handle('resizeSession', this.resizeSession.bind(this));
        ipcMain.handle('hideSession', this.hideSession.bind(this));
        ipcMain.handle('showSession', this.showSession.bind(this));
        ipcMain.handle('getURL', this.getUrl.bind(this));
        ipcMain.handle('loadURL', this.loadURL.bind(this));
        ipcMain.handle('refresh', this.refresh.bind(this));
        ipcMain.handle('stop', this.stop.bind(this));
        ipcMain.handle('backward', this.backward.bind(this));
        ipcMain.handle('forward', this.forward.bind(this));
        ipcMain.handle('canGoBackward', this.canGoBackward.bind(this));
        ipcMain.handle('canGoForward', this.canGoForward.bind(this));
        ipcMain.handle('createCollector', this.createBrowserSession.bind(this));
        ipcMain.handle('deleteCollector', this.deleteBrowserSession.bind(this));
        ipcMain.handle('updateSettings', this.updateSettings.bind(this));
        ipcMain.handle('eraseSession', this.clearSession.bind(this));
        ipcMain.handle('get', this.collectFromSession.bind(this));
        ipcMain.handle('launch', this.launchOnSession.bind(this));
        ipcMain.handle('screenshot', this.screenshot.bind(this));
        ipcMain.handle('toogleDevTool', this.toogleDevTool.bind(this));
        ipcMain.handle('versions', this.versions);
    }

    unregisterHandlers() {
        try {
            ipcMain.removeHandler('showSession');
            ipcMain.removeHandler('hideSession');
            ipcMain.removeHandler('resizeSession');
            ipcMain.removeHandler('loadURL');
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
            ipcMain.removeHandler('get');
            ipcMain.removeHandler('launch');
            ipcMain.removeHandler('screenshot');
            ipcMain.removeHandler('toogleDevTool');
            ipcMain.removeHandler('updateSettings');
            ipcMain.removeHandler('versions');

            for (const [name, session] of Object.entries(this.sessions)) {
                session.delete();
            }

            this._sessions = [];
        } catch {

        }

    }

    get(analysis_id: number, tag_id: number): BrowserSession {
        if (!analysis_id && !tag_id) {
            return this.sessions['main'];
        }

        return this.sessions['session' + analysis_id + tag_id];
    }

    hideSession() {
        this.mainWindow.setBrowserView(null);
    }

    showSession(event, analysis_id, tag_id) {
        const browserSession = this.get(analysis_id, tag_id);
        this.currentView = browserSession.view;
        this.mainWindow.setBrowserView(browserSession.view);
        return browserSession.url;
    }

    resizeSession(event, rect) {
        if (rect) {
            this.currentView.setBounds({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
        }
    }

    updateSettings(event, settings) {
        for (const [name, session] of Object.entries(this.sessions)) {
            session.applySettings(settings);
        }
    }

    getUrl(event, analysis_id, tag_id) {
        const session = this.get(analysis_id, tag_id);
        return session.url;
    }

    async loadURL(event, analysis_id, tag_id, url) {
        const session = this.get(analysis_id, tag_id);
        await session.gotoPage(url);
        return session.url;
    }

    refresh(event, analysis_id, tag_id) {
        const session = this.get(analysis_id, tag_id);
        session.reload();
    }

    stop(event, analysis_id, tag_id) {
        const session = this.get(analysis_id, tag_id);
        session.stop();
    }

    backward(event, analysis_id, tag_id) {
        const session = this.get(analysis_id, tag_id);
        session.goBack();
    }

    forward(event, analysis_id, tag_id) {
        const session = this.get(analysis_id, tag_id);
        session.goForward();
    }

    canGoBackward(event, analysis_id, tag_id) {
        const session = this.get(analysis_id, tag_id);
        return session.canGoBack();
    }

    canGoForward(event, analysis_id, tag_id) {
        const session = this.get(analysis_id, tag_id);
        return session.canGoForward();
    }

    async screenshot(event, analysis_id, tag_id, full_screenshot) {
        const session = this.get(analysis_id, tag_id);
        return await session.screenshot(full_screenshot);
    }

    toogleDevTool(event, analysis_id, tag_id) {
        const session = this.get(analysis_id, tag_id);
        session.toogleDevTool();
    }

    async createBrowserSession(event, analysis_id, tag_id, url, settings) {
        const test = process.versions.electron;
        const session_name = analysis_id && tag_id ? 'session' + analysis_id + tag_id : 'main';
        const browserSession = new BrowserSession(this.mainWindow, session_name, settings);
        this._sessions[browserSession.name] = browserSession;
        await browserSession.create();

        if (url) {
            await browserSession.gotoPage(url);
        }
    }

    async deleteBrowserSession(event, analysis_id, tag_id) {
        const session = this.get(analysis_id, tag_id);
        if (!session) return;

        const current_view = this.mainWindow.getBrowserView();

        if (session.view == current_view) {
            this.mainWindow.setBrowserView(null);
        }

        await session.delete();
        if (session.name != 'main') {
            this.sessions[session.name] = null;
        }
    }

    async clearSession(event, analysis_id, tag_id) {
        const session = this.get(analysis_id, tag_id);
        await session.clear();
    }



    async collectFromSession(event, analysis_id, tag_id, kinds) {
        const session = this.get(analysis_id, tag_id);
        return await session.collect(kinds);
    }

    async launchOnSession(event, analysis_id, tag_id, kinds) {
        const session = this.get(analysis_id, tag_id);
        return await session.launch(kinds);
    }

    get mainWindow() {
        return this._mainWindow;
    }

    get sessions() {
        return this._sessions;
    }

    versions() {
        return {
            "electron": process.versions.electron,
            "chrome": process.versions.chrome
        }
    }
}
