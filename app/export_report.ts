import {BrowserWindow} from 'electron';
const HTMLDocx = require("html-docx-js");
const fs = require("fs-extra");
const tmp = require("tmp");
tmp.setGracefulCleanup();

export function print_to_pdf(html : string){
  return new Promise(function (resolve, reject) {
    const filename = tmp.tmpNameSync({ postfix: "-pdf.html" });
    fs.writeFileSync(filename, html);

    const window_to_PDF = new BrowserWindow({show : false});//to just open the browser in background
    window_to_PDF.loadFile(filename); //give the file link you want to display
    
    window_to_PDF.webContents.on("did-finish-load", () => {
      window_to_PDF.webContents.printToPDF({}).then(data =>{
        resolve(data);
        window_to_PDF.destroy();
      }).catch(error => {
        reject(`Failed to write PDF : ${error} `);
      })
    });

  });
}

export function print_to_docx(html : string){
  return new Promise(function (resolve, reject) {
    const docx = HTMLDocx.asBlob(html);
    resolve(docx);
  });
}