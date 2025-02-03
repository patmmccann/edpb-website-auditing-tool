const { ipcRenderer } = require('electron');

import html2canvas from 'html2canvas';

ipcRenderer.on('full_screenshot', (event, partition) => {
    html2canvas(document.body).then((canvas) => {
        canvas.toBlob((blob) => {
            const reader = new FileReader();
            reader.addEventListener('loadend', () => {
                const arrayBuffer = reader.result;
                ipcRenderer.invoke('full_screenshot_image', arrayBuffer);
            });
            reader.readAsArrayBuffer(blob);
        });
    }).catch(function (error) {
        console.error('Something went wrong with capture!', error);
        ipcRenderer.invoke('full_screenshot_image', null);
    });
});