import { BrowserWindow, ipcMain } from 'electron';
const fs = require("fs-extra");
const tmp = require("tmp");
const path = require("path");
const groupBy = require("lodash/groupBy");
const pug = require("pug");
const HTMLtoDOCX = require('html-to-docx');

export class ReportsHandlher {
  constructor() {
    tmp.setGracefulCleanup();
    this.registerHandlers();
  }

  registerHandlers() {
    ipcMain.handle('export', this.export.bind(this));
    ipcMain.handle('print_to_docx', this.print_to_docx);
    ipcMain.handle('renderPug', this.renderPug);
  }

  unregisterHandlers() {
    ipcMain.removeHandler('renderPug');
    ipcMain.removeHandler('export');
    ipcMain.removeHandler('print_to_docx');
  }

  async export(event, format, html) {
    switch (format) {
      case 'pdf':
        return await this.print_to_pdf(html);
      default:
        return "";
    }
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

  print_to_pdf(html: string) {
    return new Promise((resolve, reject) => {
      const filename = tmp.tmpNameSync({ postfix: "-pdf.html" });
      fs.writeFileSync(filename, html);

      const window_to_PDF = new BrowserWindow({ show: false });//to just open the browser in background
      window_to_PDF.loadFile(filename); //give the file link you want to display

      window_to_PDF.webContents.on("did-finish-load", () => {
        window_to_PDF.webContents.printToPDF({}).then(data => {
          resolve(data);
          window_to_PDF.destroy();
        }).catch(error => {
          reject(`Failed to write PDF : ${error} `);
        })
      });

    });
  }

  async print_to_docx(event, htmlString: string, headerHTMLString: string, documentOptions:any, footerHTMLString:string) {

    try {
      const fileBuffer = await HTMLtoDOCX(htmlString, null, documentOptions, null);
      return fileBuffer;
    }
    catch(e){
      console.log(e)
    }
  }
}


