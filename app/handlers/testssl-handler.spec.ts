/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { BrowserContext, ElectronApplication, Page, _electron as electron } from 'playwright';
import { test, expect } from '@playwright/test';
import { ipcMainInvokeHandler, ipcRendererInvoke, ipcRendererCallFirstListener, ipcMainCallFirstListener, findLatestBuild, parseElectronApp } from 'electron-playwright-helpers';
import * as PATH from 'path';


test.describe('Report', () => {
  let app: ElectronApplication;
  let firstWindow: Page;
  let context: BrowserContext;

  const html_in: string = `
<!doctype html>
<html lang="en">
<head>
</head>
<body>
</body>
</html>
`;
  const documentOptions = {};

  test.beforeAll(async () => {
    app = await electron.launch({ args: [PATH.join(__dirname, '../../electron/main.js')] });
    firstWindow = await app.firstWindow();
    await firstWindow.waitForLoadState('domcontentloaded');
  });

  test('TestSSL Docker', async () => {
    const result = await ipcMainInvokeHandler(app, 'print_to_docx', html_in, null, documentOptions, null)
    expect(result).toBeInstanceOf(Object);
  });

  test('TestSSL Script', async () => {
    const result = await ipcMainInvokeHandler(app, 'print_to_pdf', html_in, null, documentOptions, null)
    expect(result).toBeInstanceOf(Object);
  });

  test.afterAll(async () => {
    await app.close();
  });
});