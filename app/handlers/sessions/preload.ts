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
declare var htmlToImage;

function setup_cookie_preload(ipcRenderer :Electron.IpcRenderer, partition : string) {
    // original object
    const origDescriptor : any= Object.getOwnPropertyDescriptor(
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
            (window as any).reportEvent("Cookie.JS", stack, value, window.location);
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
            set: function (ls, prop:string, value) {
                //console.log(`direct assignment: ${prop} = ${value}`);
                let stack = StackTrace.getSync({ offline: true });
                let hash :any= {};
                hash[prop] = value;

                // reportEvent is called within the browser context - this is defined further down
                (window as any).reportEvent(
                    "Storage.LocalStorage",
                    stack,
                    hash,
                    window.location
                );
                ls[prop] = value;
                return true;
            },
            get: function (ls, prop:string) {
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
                return (...args :any[]) => {
                    let stack = StackTrace.getSync({ offline: true });
                    let hash :any = {};
                    hash[args[0]] = args[1];
                    (window as any).reportEvent(
                        "Storage.LocalStorage",
                        stack,
                        hash,
                        window.location
                    );
                    ls.setItem.apply(ls, args as any);
                };
            },
        }),
    });

    // we modify the browser window and expose the function reportEvent on window
    // this is used to pull out browser-context data and sending it our logger
    (window as any).reportEvent = (type :string, stack :any, data :any, location :any) => {
        ipcRenderer.invoke('reportEvent'+partition, type, stack, data, JSON.stringify(location));
    }

};

ipcRenderer.on('dntJs', (event, messages) => {
    contextBridge.exposeInMainWorld(
        'navigator',
        {
            doNotTrack: 1
        });
});


ipcRenderer.on('init', (event, partition) => {
    setup_cookie_preload(ipcRenderer, partition);
});

ipcRenderer.on('full_screenshot', (event, partition) => {
    const $body = document.querySelectorAll('body')[0];
    console.log("go");
    htmlToImage.toPng($body, { cacheBust: true })
    .then((image)=>{
            ipcRenderer.invoke('full_screenshot_image', image);
    })
    .catch(function (error) {
        console.error('Something went wrong with capture!', error);
    });
});