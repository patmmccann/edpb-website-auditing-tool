import { BrowserContext, ElectronApplication, Page, _electron as electron } from 'playwright';
import { test, expect } from '@playwright/test';
import { ipcMainInvokeHandler, ipcRendererInvoke, ipcRendererCallFirstListener, ipcMainCallFirstListener, findLatestBuild, parseElectronApp } from 'electron-playwright-helpers';
import * as PATH from 'path';


test.describe('Report', () => {
  let app: ElectronApplication;
  let firstWindow: Page;
  let context: BrowserContext;

  test.beforeAll(async () => {
    app = await electron.launch({ args: [PATH.join(__dirname, '../../electron/main.js')] });
    firstWindow = await app.firstWindow();
    await firstWindow.waitForLoadState('domcontentloaded');
  });

  test('Testing navigation', async () => {
    await ipcMainInvokeHandler(app, 'createCollector');
    await ipcMainInvokeHandler(app, 'showSession');
    await ipcMainInvokeHandler(app, 'loadURL', null, null, "https://www.example.com/");
    let url = await ipcMainInvokeHandler(app, 'getURL');
    let canGoBackward = await ipcMainInvokeHandler(app, 'canGoBackward');
    let canGoForward = await ipcMainInvokeHandler(app, 'canGoForward');
    expect(url).toBe("https://www.example.com/");
    expect(canGoBackward).toBeFalsy();
    expect(canGoForward).toBeFalsy();
    await ipcMainInvokeHandler(app, 'loadURL', null, null, "https://www.example.net/");
    url = await ipcMainInvokeHandler(app, 'getURL');
    canGoBackward = await ipcMainInvokeHandler(app, 'canGoBackward');
    canGoForward = await ipcMainInvokeHandler(app, 'canGoForward');
    expect(url).toBe("https://www.example.net/");
    expect(canGoBackward).toBeTruthy();
    expect(canGoForward).toBeFalsy();
    await ipcMainInvokeHandler(app, 'backward');
    url = await ipcMainInvokeHandler(app, 'getURL');
    canGoBackward = await ipcMainInvokeHandler(app, 'canGoBackward');
    canGoForward = await ipcMainInvokeHandler(app, 'canGoForward');
    expect(canGoBackward).toBeFalsy();
    expect(canGoForward).toBeTruthy();
    // expect(url).toBe("https://www.example.com/");
    // await ipcMainInvokeHandler(app, 'forward');
    // url = await ipcMainInvokeHandler(app, 'getURL');
    // canGoBackward = await ipcMainInvokeHandler(app, 'canGoBackward');
    // canGoForward = await ipcMainInvokeHandler(app, 'canGoForward');
    // expect(url).toBe("https://www.example.net/");
    // expect(canGoBackward).toBeTruthy();
    // expect(canGoForward).toBeFalsy();
  });

  test.afterAll(async () => {
    await app.close();
  });
});