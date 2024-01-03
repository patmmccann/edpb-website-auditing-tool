import { BrowserContext, ElectronApplication, Page, _electron as electron } from 'playwright';
import { test, expect } from '@playwright/test';
import { ipcMainInvokeHandler, ipcRendererInvoke, ipcRendererCallFirstListener, ipcMainCallFirstListener, findLatestBuild, parseElectronApp } from 'electron-playwright-helpers';
import * as PATH from 'path';


test.describe('Cookie Card', () => {
  let app: ElectronApplication;
  let firstWindow: Page;
  let context: BrowserContext;

  test.beforeAll(async () => {
    app = await electron.launch({ args: [PATH.join(__dirname, '../../../electron/main.js')] });
    firstWindow = await app.firstWindow();
    await firstWindow.waitForLoadState('domcontentloaded');

  });
  
  test('List cookies on edpb.europa.eu', async () => {

    const args = {};

    function timeout(ms:number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    await ipcMainInvokeHandler(app, 'createCollector', null, null, "https://edpb.europa.eu/", args);
    await ipcMainInvokeHandler(app, 'showSession');
    await timeout(500);
    const url = await ipcMainInvokeHandler(app, 'getURL');
    const output :any = await ipcMainInvokeHandler(app, 'get', null, null, ['cookie'],false, args);
    expect(output).toHaveProperty('cookies');
    expect(output.cookies).toHaveProperty('cookies');
    expect(output.cookies).toHaveLength(0);
    await ipcMainInvokeHandler(app, 'deleteCollector');
  });

  test.afterAll(async () => {
    await app.close();
  });
});

