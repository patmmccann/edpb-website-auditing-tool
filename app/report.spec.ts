import { BrowserContext, ElectronApplication, Page, _electron as electron } from 'playwright';
import { test, expect } from '@playwright/test';
import { ipcMainInvokeHandler, ipcRendererInvoke, ipcRendererCallFirstListener,ipcMainCallFirstListener,findLatestBuild, parseElectronApp} from 'electron-playwright-helpers';
import * as PATH from 'path';

let electronApp: ElectronApplication;

test.describe('Report', () => {
  let app: ElectronApplication;
  let firstWindow: Page;
  let context: BrowserContext;

  test.beforeAll( async () => {
    app = await electron.launch({ args: [PATH.join(__dirname, '../electron/main.js')] });
    firstWindow = await app.firstWindow();
    await firstWindow.waitForLoadState('domcontentloaded');
  });

  test('Docx report', async () => {
    const test= "tmpText"; //TODO : Add real html text
    const documentOptions = {};
    const result = await ipcMainInvokeHandler(app, 'print_to_docx', test, null, documentOptions, null)
    expect(result).toBeInstanceOf(Object);
  });

  test.afterAll( async () => {
    await app.close();
  });
});