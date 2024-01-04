import { BrowserContext, ElectronApplication, Page, _electron as electron } from 'playwright';
import { test, expect } from '@playwright/test';
import { ipcMainInvokeHandler, ipcRendererInvoke, ipcRendererCallFirstListener, ipcMainCallFirstListener, findLatestBuild, parseElectronApp } from 'electron-playwright-helpers';
import * as PATH from 'path';


test.describe('Traffic Card', () => {
  let app: ElectronApplication;
  let firstWindow: Page;
  let context: BrowserContext;

  test.beforeAll(async () => {
    app = await electron.launch({ args: [PATH.join(__dirname, '../../../electron/main.js')] });
    firstWindow = await app.firstWindow();
    await firstWindow.waitForLoadState('domcontentloaded');

  });
  
  test('List traffic on edpb.europa.eu', async () => {

    const settings = {traffic:true};

    function timeout(ms:number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    await ipcMainInvokeHandler(app, 'createCollector', null, null, "https://edpb.europa.eu/", settings);
    await ipcMainInvokeHandler(app, 'showSession');
    await timeout(500);
    const url = await ipcMainInvokeHandler(app, 'getURL');
    const output :any = await ipcMainInvokeHandler(app, 'get', null, null, ['traffic']);
    expect(output).toHaveProperty('hosts');
    expect(output.hosts).toHaveProperty('requests');
    expect(output.hosts.requests).toHaveProperty('thirdParty');
    expect(output.hosts.requests.thirdParty).toHaveLength(2);
    expect(output.hosts.requests.thirdParty[0]).toBe("edpb.europa.eu");
    expect(output.hosts.requests.thirdParty[1]).toBe("europa.eu");
    await ipcMainInvokeHandler(app, 'deleteCollector');
  });

  test.afterAll(async () => {
    await app.close();
  });
});

