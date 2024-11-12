/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 * 
 * Based on https://github.com/EU-EDPS/website-evidence-collector/blob/master/lib/setup-cookie-recording.js
 * from the Website Evidence Collector (https://github.com/EU-EDPS/website-evidence-collector)
 */
const { ipcRenderer, contextBridge } = require('electron');

declare var StackTrace;
declare var html2canvas;

// original object
const origDescriptor: any = Object.getOwnPropertyDescriptor(
    Document.prototype,
    "cookie"
);

// new method, which will log the cookie being set, and then pass it on
// to the original object
Object.defineProperty(document, "cookie", {
    get() {
        return origDescriptor.get.call(this);
    },
    set(value) {
        // https://www.stacktracejs.com/#!/docs/stacktrace-js
        let stack = StackTrace.getSync({ offline: true });

        // inside our wrapper we execute the .reportEvent from within the browser
        // reportEvent is defined further down
        ipcRenderer.invoke('reportEvent', "Cookie.JS", stack, value, JSON.stringify(window.location));
        return origDescriptor.set.call(this, value);
    },
    enumerable: true,
    configurable: true,
});

// inject storage set recorder
// https://stackoverflow.com/a/49093643/1407622
Object.defineProperty(window, "localStorage", {
    configurable: true,
    enumerable: true,
    value: new Proxy(localStorage, {
        set: function (ls, prop: string, value) {
            //console.log(`direct assignment: ${prop} = ${value}`);
            let stack = StackTrace.getSync({ offline: true });
            let hash: any = {};
            hash[prop] = value;
            ipcRenderer.invoke('reportEvent', "Storage.LocalStorage", stack, hash, JSON.stringify(window.location));
            ls[prop] = value;
            return true;
        },
        get: function (ls, prop: string) {
            // The only property access we care about is setItem. We pass
            // anything else back without complaint. But using the proxy
            // fouls 'this', setting it to this {set: fn(), get: fn()}
            // object.
            if (prop !== "setItem") {
                if (typeof ls[prop] === "function") {
                    return ls[prop].bind(ls);
                } else {
                    return ls[prop];
                }
            }
            return (...args: any[]) => {
                let stack = StackTrace.getSync({ offline: true });
                let hash: any = {};
                hash[args[0]] = args[1];
                ipcRenderer.invoke('reportEvent', "Storage.LocalStorage", stack, hash, JSON.stringify(window.location));
                ls.setItem.apply(ls, args as any);
            };
        },
    }),
});


ipcRenderer.on('dntJs', (event, messages) => {
    contextBridge.exposeInMainWorld(
        'navigator',
        {
            doNotTrack: 1
        });
});

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