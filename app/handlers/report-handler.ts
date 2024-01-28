/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 * 
 * Based on https://github.com/EU-EDPS/website-evidence-collector/blob/master/reporter/index.js
 * from the Website Evidence Collector (https://github.com/EU-EDPS/website-evidence-collector)
 */
import { BrowserWindow, ipcMain } from 'electron';
const fs = require("fs-extra");
const tmp = require("tmp");
const path = require("path");
const groupBy = require("lodash/groupBy");
const pug = require("pug");
const HTMLtoDOCX = require('html-to-docx');

export class ReportsHandler {
  constructor() {
    tmp.setGracefulCleanup();
    this.registerHandlers();
  }

  registerHandlers() {
    ipcMain.handle('print_to_docx', this.print_to_docx);
    ipcMain.handle('print_to_pdf', this.print_to_pdf);
    ipcMain.handle('renderPug', this.renderPug);
  }

  unregisterHandlers() {
    ipcMain.removeHandler('renderPug');
    ipcMain.removeHandler('print_to_docx');
    ipcMain.removeHandler('print_to_pdf');
  }

  renderPug(event, template, data) {
    return pug.render(template,
      Object.assign({}, data, {
        pretty: true,
        basedir: path.join(__dirname, "../assets"),
        jsondir: ".", // images in the folder of the inspection.json
        groupBy: groupBy,
        inlineCSS: fs.readFileSync(
          require.resolve("github-markdown-css/github-markdown.css")
        ),
      })
    );
  }

  print_to_pdf(event, htmlString: string, headerHTMLString: string, documentOptions:any, footerHTMLString:string) {
    return new Promise((resolve, reject) => {
      const window_to_PDF = new BrowserWindow({ show: false });//to just open the browser in background
      const html_content = 'data:text/html;charset=UTF-8,' + encodeURIComponent(htmlString);
      window_to_PDF.loadURL(html_content); //give the file link you want to display

      window_to_PDF.webContents.on("did-finish-load", () => {
        window_to_PDF.webContents.printToPDF(documentOptions).then(data => {
          resolve(data);
          window_to_PDF.destroy();
        }).catch(error => {
          reject(`Failed to write PDF : ${error} `);
        })
      });

    });


  }

  async print_to_docx(event, htmlString: string, headerHTMLString: string, documentOptions:any, footerHTMLString:string) {
    const fileBuffer = await HTMLtoDOCX(htmlString, headerHTMLString, documentOptions, footerHTMLString);
    return fileBuffer;
  }
}


