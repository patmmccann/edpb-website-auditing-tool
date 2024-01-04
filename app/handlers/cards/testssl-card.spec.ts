import { BrowserContext, ElectronApplication, Page, _electron as electron } from 'playwright';
import { test, expect } from '@playwright/test';
import { ipcMainInvokeHandler, ipcRendererInvoke, ipcRendererCallFirstListener, ipcMainCallFirstListener, findLatestBuild, parseElectronApp } from 'electron-playwright-helpers';
import * as PATH from 'path';


test.describe('TestSSL Card', () => {
  let app: ElectronApplication;
  let firstWindow: Page;
  let context: BrowserContext;

  test.beforeAll(async () => {
    app = await electron.launch({ args: [PATH.join(__dirname, '../../../electron/main.js')] });
    firstWindow = await app.firstWindow();
    await firstWindow.waitForLoadState('domcontentloaded');
  });

  test('TestSSL Script', async () => {
    test.setTimeout(360000);

    const args = {
      "testssl": true,
      "testssl_type": "script",
      "test_ssl_location": "./test/testssl.sh-3.2rc3/testssl.sh"
    };
    function timeout(ms:number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    await ipcMainInvokeHandler(app, 'createCollector', null, null, "http://www.example.com/", args);
    await ipcMainInvokeHandler(app, 'showSession');
    await timeout(500);
    const url = await ipcMainInvokeHandler(app, 'getURL');
    await ipcMainInvokeHandler(app, 'launch', null, null, ['testSSL']);
    const output :any = await ipcMainInvokeHandler(app, 'get', null, null, ['testSSL']);
    expect(output).toHaveProperty('testSSL');
    expect(output.testSSLError).toBeNull;
    expect(output.testSSLErrorCode).toBeNull;
    expect(output.testSSLErrorOutput).toBeNull;
    expect(output.testSSL).toHaveProperty('scanResult');
    expect(output.testSSL.scanResult).toHaveLength(1);
    await ipcMainInvokeHandler(app, 'deleteCollector');
  });

  test('TestSSL docker', async () => {
    test.setTimeout(120000);
    const args = {
      "testssl": true,
      "testssl_type": "docker"
    };
    function timeout(ms:number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    await ipcMainInvokeHandler(app, 'createCollector', null, null, "http://www.example.com/", args);
    await ipcMainInvokeHandler(app, 'showSession');
    await timeout(500);
    const url = await ipcMainInvokeHandler(app, 'getURL');
    await ipcMainInvokeHandler(app, 'launch', null, null, ['testSSL']);
    const output :any = await ipcMainInvokeHandler(app, 'get', null, null, ['testSSL']);
    expect(output).toHaveProperty('testSSL');
    expect(output.testSSLError).toBeNull;
    expect(output.testSSLErrorCode).toBeNull;
    expect(output.testSSLErrorOutput).toBeNull;
    expect(output.testSSL).toHaveProperty('scanResult');
    expect(output.testSSL.scanResult).toHaveLength(1);
    await ipcMainInvokeHandler(app, 'deleteCollector');
  });

  test.afterAll(async () => {
    await app.close();
  });
});

