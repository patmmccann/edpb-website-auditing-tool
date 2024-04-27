
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

    async testSSLLocation(event, type: string) {
        return "To be implemented";
    }
}