
import { BrowserWindow, ipcMain } from 'electron';

export class TestSSLHandler {

    constructor() {
        this.registerHandlers();
    }

    registerHandlers() {
        ipcMain.handle('testSSLLocation', this.testSSLLocation);
      }
    
      unregisterHandlers() {
        ipcMain.removeHandler('testSSLLocation');
    }

    async testSSLLocation(event, settings: any) {
        const { exec } = require("child_process");
        
        if (!settings.testssl_type || settings.testssl_type ==""){
            return "Error : select a testssl type first.";
        }
        let cmd;

        switch(settings.testssl_type){
            case "docker":
                cmd = `docker run --rm -t drwetter/testssl.sh:3.0 -b`;
                break;

            case "script":
                const testsslExecutable = settings.test_ssl_location || "testssl.sh";
                cmd = `${testsslExecutable} -b`;
                break;
        }

        return new Promise(resolve =>{
            exec(cmd, (e, stdout, stderr) => {
                if (e) {
                    resolve(e.message.toString());
                }

                if(stdout){
                    resolve(stdout);
                }

                if(stderr){
                    resolve(stderr);
                }
                resolve("Unknow erre Error : Docker isn't installed.");
              });
        });
    }
}