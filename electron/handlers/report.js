"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsHandlher = void 0;
const electron_1 = require("electron");
const fs = require("fs-extra");
const tmp = require("tmp");
const path = require("path");
const groupBy = require("lodash/groupBy");
const pug = require("pug");
const HTMLtoDOCX = require('html-to-docx');
class ReportsHandlher {
    constructor() {
        tmp.setGracefulCleanup();
        this.registerHandlers();
    }
    registerHandlers() {
        electron_1.ipcMain.handle('print_to_docx', this.print_to_docx);
        electron_1.ipcMain.handle('print_to_pdf', this.print_to_pdf);
        electron_1.ipcMain.handle('renderPug', this.renderPug);
    }
    unregisterHandlers() {
        electron_1.ipcMain.removeHandler('renderPug');
        electron_1.ipcMain.removeHandler('print_to_docx');
        electron_1.ipcMain.removeHandler('print_to_pdf');
    }
    renderPug(event, template, data) {
        return pug.render(template, Object.assign({}, data, {
            pretty: true,
            basedir: path.join(__dirname, "../assets"),
            jsondir: ".",
            groupBy: groupBy,
            inlineCSS: fs.readFileSync(require.resolve("github-markdown-css/github-markdown.css")),
        }));
    }
    print_to_pdf(event, htmlString, headerHTMLString, documentOptions, footerHTMLString) {
        return new Promise((resolve, reject) => {
            const window_to_PDF = new electron_1.BrowserWindow({ show: false }); //to just open the browser in background
            const html_content = 'data:text/html;charset=UTF-8,' + encodeURIComponent(htmlString);
            window_to_PDF.loadURL(html_content); //give the file link you want to display
            window_to_PDF.webContents.on("did-finish-load", () => {
                window_to_PDF.webContents.printToPDF(documentOptions).then(data => {
                    resolve(data);
                    window_to_PDF.destroy();
                }).catch(error => {
                    reject(`Failed to write PDF : ${error} `);
                });
            });
        });
    }
    print_to_docx(event, htmlString, headerHTMLString, documentOptions, footerHTMLString) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileBuffer = yield HTMLtoDOCX(htmlString, headerHTMLString, documentOptions, footerHTMLString);
            return fileBuffer;
        });
    }
}
exports.ReportsHandlher = ReportsHandlher;
