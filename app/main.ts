/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { app, BrowserWindow, globalShortcut, ipcMain, Menu } from 'electron';
import * as windowStateKeeper from 'electron-window-state';
import * as isDev from 'electron-is-dev';
import * as path from 'path';
import * as url from 'url';

const gotTheLock = app.requestSingleInstanceLock();

import { BrowsersHandler } from "./handlers/browser-handler";
import { ReportsHandler } from './handlers/report-handler';
import { ParserHandler } from './handlers/parser-handler';
import { TestSSLHandler } from './handlers/testssl-handler';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null = null;

const menu = Menu.buildFromTemplate([
    {
        label: "Edit",
        submenu: [
            { role: "undo" },
            { role: "redo" },
            { type: "separator" },
            { role: "cut" },
            { role: "copy" },
            { role: "paste" },
            { role: "delete" }
        ]
    },
    {
        label: "View",
        submenu: [
            { role: "togglefullscreen" }
        ]
    },
    {
        role: "window",
        submenu: [{ role: "minimize" }, { role: "close" }]
    }
]);

function createWindow() {
    let winState = windowStateKeeper({
        defaultWidth: 1400,
        defaultHeight: 800
    });

    Menu.setApplicationMenu(menu);

    globalShortcut.register("CommandOrControl+R", () => {
        // Do nothing
    });

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: winState.width,
        height: winState.height,
        x: winState.x,
        y: winState.y,
        minWidth: 900,
        minHeight: 600,
        alwaysOnTop: false,
        fullscreen: false,
        kiosk: false,
        icon: path.join(`${__dirname}/logo.png`),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            plugins: true
        }
    });

    winState.manage(mainWindow);

    if (isDev) {
        const debug = require('electron-debug');
        debug();

        require('electron-reloader')(module);

        mainWindow.loadURL("http://localhost:4200/");

        // Open the DevTools.
        mainWindow.webContents.openDevTools();
    } else {
        // and load the index.html of the app.
        mainWindow.loadURL(
            url.format({
                pathname: path.join(__dirname, "../dist", "website-audit", "index.html"),
                protocol: "file:",
                slashes: true
            })
        );
    }
    const browserHandlers = new BrowsersHandler(mainWindow);
    const reportsHandler = new ReportsHandler();
    const parserHandler = new ParserHandler();
    const testSSLHandler = new TestSSLHandler();

    async function parseHar() {
        var fs = require('fs');
        var har = JSON.parse(fs.readFileSync('./test/firefox.har', 'utf8'));
        const output = await parserHandler.parseHar(null, har, null);
        console.log(output);
    }

    //parseHar();

    // Emitted when the window is closed.
    mainWindow.on("closed", function () {
        browserHandlers.unregisterHandlers();
        reportsHandler.unregisterHandlers();
        parserHandler.unregisterHandlers();
        testSSLHandler.unregisterHandlers();

        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    /*app.on("web-contents-created", (webContentsCreatedEvent, contents)=>{
        contents.on("will-navigate", function(e, url) {
            e.preventDefault();
            require("electron").shell.openExternal(url);
        });
    });*/

    /*
    mainWindow.webContents.on('new-window', function (e, url) {
        e.preventDefault();
        require("electron").shell.openExternal(url);
    });*/
}

if (!gotTheLock) {
    app.quit();
} else {
    app.on("second-instance", (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on("ready", createWindow);

    // Quit when all windows are closed.
    app.on("window-all-closed", function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== "darwin") {
            app.quit();
        }
    });

    app.on("activate", function () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null) {
            createWindow();
        }
    });
}


