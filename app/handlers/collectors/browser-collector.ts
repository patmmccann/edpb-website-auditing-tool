/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import { WebContentsView, WebContents, ipcMain } from 'electron';
import { Collector } from "./collector";
import { Card } from '../cards/card';


export class BrowserCollector extends Collector {
    _session_name: string;
    _view: WebContentsView;
    _contents: WebContents;
    _cards: Card[] = [];


    constructor(session_name, settings) {
        super(settings);
        this._session_name = session_name;
        this._cards = this.createCardFromSettings();
    }

    async createCollector(view: WebContentsView) {
        this._view = view;
        this._contents = view.webContents;

        // forward logs from the browser console
        this._contents.on("console-message", (event, level, msg, line, sourceId) => {
            if (this.logger.writable == false) return;
            this.logger.log("debug", msg, { type: "Browser.Console" })
        });

        this._cards.forEach(card => card.enable());
    }

    end() {
        this._contents.session.webRequest.onBeforeRequest(null, null);
        this._contents.session.webRequest.onHeadersReceived(null, null);
        this._cards.forEach(card => card.disable());

        this._end_date = new Date();
        return super.end();
    }

    async clear() {
        this.createLogger();
        this._cards.forEach(card => card.clear());
    }

    override get view() {
        return this._view;
    }

    override get contents() {
        if (this.view) {
            return this.view.webContents;
        }

        return null;
    }

    getTopLevelUrl(details) {
        let frame = details.frame;
        let sourceUrl = '';
        // TODO : Fixme
        try {
            while (frame !== null) {
                sourceUrl = frame.url;
                if (sourceUrl.length !== 0) {
                    break;
                }
                frame = frame.parent;
            }
        } catch (e) {

        }

        return sourceUrl;
    }

    async collect(kinds) {
        const output = {};
        await this.refresh();

        for (let kind of kinds) {
            const card = this._cards.find(x => x.name == kind);
            if (!card) {
                this.logger.log("error", "A card has been called which has not been initialized", { type: "Browser.Error" })
            } else {
                await card.inspect(output);
            }
        }


        return output;
    }

    async launch(kinds) {
        for (let kind of kinds) {
            const card = this._cards.find(x => x.name == kind);
            if (!card) {
                this.logger.log("error", "A card has been called which has not been initialized", { type: "Browser.Error" })
            } else {
                return await card.launch();
            }
        }
    }

    override get isElectron() {
        return true;
    }

    findInHeaders(details, header) {
        const cookieHTTPHeader = Object.keys(details.responseHeaders).find(key => key.toLowerCase() === "set-cookie");

        if (cookieHTTPHeader) {
            return details.responseHeaders[cookieHTTPHeader];
        }
        return [];
    }
    getUrlFromResponse(details: any) {
        return details.url;
    }

    override get mainUrl() {
        return this.contents.mainFrame.url;
    }

    override  async cookies() {
        return await this.contents.session.cookies.get({});
    }

    reportEvent(type, stack, data, location) {
        const json_location = JSON.parse(location);

        // determine actual browsed page
        let browsedLocation = json_location.href;
        if (json_location.ancestorOrigins && json_location.ancestorOrigins[0]) {
            // apparently, this is a chrome-specific API
            browsedLocation = json_location.ancestorOrigins[0];
        }

        // construct the event object to log
        // include the stack
        let event = {
            type: type,
            stack: stack.slice(1, stack.length), // remove reference to Document.set (0)
            origin: json_location.origin,
            location: browsedLocation,
            raw: data,
            data: data
        };

        let message = "";
        if (type in this.event_logger) {
            message = this.event_logger[type](event, json_location);
        }

        if (this.logger.writable == false) return;
        this.logger.log("warn", message, event);
    }
}