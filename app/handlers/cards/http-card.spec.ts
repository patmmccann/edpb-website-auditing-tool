/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { BrowserContext, ElectronApplication, Page, _electron as electron } from 'playwright';
import { test, expect } from '@playwright/test';
import { ipcMainInvokeHandler, ipcRendererInvoke, ipcRendererCallFirstListener, ipcMainCallFirstListener, findLatestBuild, parseElectronApp } from 'electron-playwright-helpers';
import * as PATH from 'path';


test.describe('HTTP Card', () => {
  let app: ElectronApplication;
  let firstWindow: Page;
  let context: BrowserContext;
  const settings = {https:true};

  test.beforeAll(async () => {
    app = await electron.launch({ args: [PATH.join(__dirname, '../../../electron/main.js')] });
    firstWindow = await app.firstWindow();
    await firstWindow.waitForLoadState('domcontentloaded');

  });
  
  test('Test HTTPS on example.com', async () => {
    function timeout(ms:number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    await ipcMainInvokeHandler(app, 'createCollector', null, null, "http://www.example.com/", settings);
    await ipcMainInvokeHandler(app, 'showSession');
    await timeout(500);
    const url = await ipcMainInvokeHandler(app, 'getURL');
    await ipcMainInvokeHandler(app, 'launch', null, null, ['https']);
    const output :any = await ipcMainInvokeHandler(app, 'get', null, null, ['https']);
    expect(output).toHaveProperty('secure_connection');
    expect(output.secure_connection).toHaveProperty('https_redirect');
    expect(output.secure_connection).toHaveProperty('https_support');
    expect(output.secure_connection).toHaveProperty('redirects');
    expect(output.secure_connection.https_redirect).toBeFalsy();
    expect(output.secure_connection.https_support).toBeTruthy();
    expect(output.secure_connection).toHaveProperty('https_support');
    expect(output.secure_connection.redirects).toHaveLength(0);
    await ipcMainInvokeHandler(app, 'deleteCollector');
  });

  test('Test HTTPS on edpb.europa.eu', async () => {
    function timeout(ms:number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    await ipcMainInvokeHandler(app, 'createCollector', null, null, "https://edpb.europa.eu/", settings);
    await ipcMainInvokeHandler(app, 'showSession');
    await timeout(500);
    const url = await ipcMainInvokeHandler(app, 'getURL');
    await ipcMainInvokeHandler(app, 'launch', null, null, ['https']);
    const output :any = await ipcMainInvokeHandler(app, 'get', null, null, ['https']);
    expect(output).toHaveProperty('secure_connection');
    expect(output.secure_connection).toHaveProperty('https_redirect');
    expect(output.secure_connection).toHaveProperty('https_support');
    expect(output.secure_connection).toHaveProperty('redirects');
    expect(output.secure_connection.https_redirect).toBeTruthy();
    expect(output.secure_connection.https_support).toBeTruthy();
    expect(output.secure_connection).toHaveProperty('https_support');
    expect(output.secure_connection.redirects).toHaveLength(1);
    expect(output.secure_connection.redirects[0]).toBe("https://edpb.europa.eu/edpb_en");
    await ipcMainInvokeHandler(app, 'deleteCollector');
  });

  test.afterAll(async () => {
    await app.close();
  });
});

