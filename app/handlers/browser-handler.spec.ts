/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { BrowserContext, ElectronApplication, Page, _electron as electron } from 'playwright';
import { test, expect } from '@playwright/test';
import { ipcMainInvokeHandler, ipcRendererInvoke, ipcRendererCallFirstListener, ipcMainCallFirstListener, findLatestBuild, parseElectronApp } from 'electron-playwright-helpers';
import * as PATH from 'path';

test.describe('Toolbar', () => {
  let app: ElectronApplication;
  let firstWindow: Page;
  let context: BrowserContext;

  test.beforeAll(async () => {
    app = await electron.launch({ args: [PATH.join(__dirname, '../../electron/main.js')] });
    firstWindow = await app.firstWindow();
    await firstWindow.waitForLoadState('domcontentloaded');
    await ipcMainInvokeHandler(app, 'createCollector');
    await ipcMainInvokeHandler(app, 'showSession');
  });

  test('Navigation', async () => {

    function timeout(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    await ipcMainInvokeHandler(app, 'loadURL', null, null, "https://www.example.com/");
    await timeout(500);
    let url = await ipcMainInvokeHandler(app, 'getURL');
    let canGoBackward = await ipcMainInvokeHandler(app, 'canGoBackward');
    let canGoForward = await ipcMainInvokeHandler(app, 'canGoForward');
    expect(url).toBe("https://www.example.com/");
    expect(canGoBackward).toBeFalsy();
    expect(canGoForward).toBeFalsy();
    await ipcMainInvokeHandler(app, 'loadURL', null, null, "https://www.example.net/");
    await timeout(500);
    url = await ipcMainInvokeHandler(app, 'getURL');
    canGoBackward = await ipcMainInvokeHandler(app, 'canGoBackward');
    canGoForward = await ipcMainInvokeHandler(app, 'canGoForward');
    expect(url).toBe("https://www.example.net/");
    expect(canGoBackward).toBeTruthy();
    expect(canGoForward).toBeFalsy();
    await ipcMainInvokeHandler(app, 'backward');
    await timeout(500);
    url = await ipcMainInvokeHandler(app, 'getURL');
    canGoBackward = await ipcMainInvokeHandler(app, 'canGoBackward');
    canGoForward = await ipcMainInvokeHandler(app, 'canGoForward');
    expect(canGoBackward).toBeFalsy();
    expect(canGoForward).toBeTruthy();
    expect(url).toBe("https://www.example.com/");
    await ipcMainInvokeHandler(app, 'forward');
    await timeout(500);
    url = await ipcMainInvokeHandler(app, 'getURL');
    canGoBackward = await ipcMainInvokeHandler(app, 'canGoBackward');
    canGoForward = await ipcMainInvokeHandler(app, 'canGoForward');
    expect(url).toBe("https://www.example.net/");
    expect(canGoBackward).toBeTruthy();
    expect(canGoForward).toBeFalsy();
  });

  test('Screenshot', async () => {
    const screenshot = await ipcMainInvokeHandler(app, 'screenshot');
    expect(screenshot).toBeInstanceOf(Object);
  });



  test.afterAll(async () => {
    await ipcMainInvokeHandler(app, 'deleteCollector');
    await app.close();
  });
});