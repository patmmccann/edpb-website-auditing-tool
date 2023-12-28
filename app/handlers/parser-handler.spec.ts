import { BrowserContext, ElectronApplication, Page, _electron as electron } from 'playwright';
import { test, expect } from '@playwright/test';
import { ipcMainInvokeHandler, ipcRendererInvoke, ipcRendererCallFirstListener, ipcMainCallFirstListener, findLatestBuild, parseElectronApp } from 'electron-playwright-helpers';
import * as PATH from 'path';
import { ParserHandler } from './parser-handler';


test.describe('Har Parser', () => {
  let app: ElectronApplication;
  let firstWindow: Page;
  let context: BrowserContext;

  test.beforeAll(async () => {
    app = await electron.launch({ args: [PATH.join(__dirname, '../../electron/main.js')] });
    firstWindow = await app.firstWindow();
    await firstWindow.waitForLoadState('domcontentloaded');
  });

  test('Chrome parser', async () => {
    const fs = require('fs');
    const har = JSON.parse(fs.readFileSync('./test/chrome.har', 'utf8'));
    const output =  await ipcMainInvokeHandler(app, 'parseHar', har, null);
    expect(output).toHaveProperty('beacons');
    expect(output).toHaveProperty('cookies');
    expect(output).toHaveProperty('hosts');
  });

  test('Firefox parser', async () => {
    const fs = require('fs');
    const har = JSON.parse(fs.readFileSync('./test/firefox.har', 'utf8'));
    const output =  await ipcMainInvokeHandler(app, 'parseHar', har, null);
    expect(output).toHaveProperty('beacons');
    expect(output).toHaveProperty('cookies');
    expect(output).toHaveProperty('hosts');
  });

  test('Safari parser', async () => {
    const fs = require('fs');
    const har = JSON.parse(fs.readFileSync('./test/safari.har', 'utf8'));
    const output =  await ipcMainInvokeHandler(app, 'parseHar', har, null);
    expect(output).toHaveProperty('beacons');
    expect(output).toHaveProperty('cookies');
    expect(output).toHaveProperty('hosts');
  });

  test.afterAll(async () => {
    await app.close();
  });
});

