
import { BrowserView, WebContents, ipcMain } from 'electron';
import { TrafficCard } from "../cards/traffic-card";
import { BeaconCard } from "../cards/beacon-card";
import { CookieCard } from "../cards/cookie-card";
import { LocalStorageCard } from "../cards/local-storage-card";
import { UnsafeFormCard } from "../cards/unsafe-form-card";
import { TestSSLCard } from "../cards/testssl-card";
import {Collector} from "./collector";

const collector_connection = require("../../../collector/connection");


export class BrowserCollector extends Collector {
    _output: any = {};
    _session_name: string;
    _view: BrowserView;
    _contents: WebContents;
    _traffic_card: TrafficCard;
    _beacon_card: BeaconCard;
    _cookie_card: CookieCard;
    _local_storage_card: LocalStorageCard;
    _unsafe_form_card: UnsafeFormCard;
    _test_ssl_card: TestSSLCard;

    constructor(session_name, args) {
        super();
        this._session_name = session_name;
        this._args = args;
        this._traffic_card = new TrafficCard(this);
        this._beacon_card = new BeaconCard(this);
        this._cookie_card = new CookieCard(this);
        this._local_storage_card = new LocalStorageCard(this);
        this._unsafe_form_card = new UnsafeFormCard(this);
        this._test_ssl_card = new TestSSLCard(this);
    }

    async createCollector(view: BrowserView, args) {
        this._view = view;
        this._contents = view.webContents;
        this._args = args;
        const event_logger = {};

        const cookie_logger = this._cookie_card.register_event_logger;
        const local_storage_logger = this._local_storage_card.register_event_logger;

        event_logger[cookie_logger.type] = cookie_logger.logger;
        event_logger[local_storage_logger.type] = local_storage_logger.logger;
        ipcMain.removeHandler('reportEvent' + this._session_name);
        ipcMain.handle('reportEvent' + this._session_name, async (reportEvent, type, stack, data, location) => {
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
                stack: stack.slice(1,stack.length), // remove reference to Document.set (0)
                origin: json_location.origin,
                location: browsedLocation,
                raw: data,
                data:data
            };

            let message = "";
            if (type in event_logger){
                message = event_logger[type](event, json_location);
            }

            if (this.logger.writable == false) return;
            this.logger.log("warn", message, event);
        });



        // forward logs from the browser console
        this._contents.on("console-message", (event, level, msg, line, sourceId) =>{
            if (this.logger.writable == false) return;
            this.logger.log("debug", msg, { type: "Browser.Console" })
        });

        // forward logs from each requests browser console
        this._contents.session.webRequest.onBeforeRequest(async (details, callback) => {
            this._traffic_card.add(details);
            this._beacon_card.add(details);
            callback({});
        });

        // setup tracking
        this._contents.session.webRequest.onHeadersReceived(async (details, callback) => {
            this._cookie_card.add(details);
            callback({});
        });
    }

    end() {
        this._contents.session.webRequest.onBeforeRequest(null, null);
        this._contents.session.webRequest.onHeadersReceived(null, null);
        ipcMain.removeHandler('reportEvent' + this._session_name);

        this._end_date = new Date();
        return super.end();
    }

    async clear(args) {
        this.createLogger();
        this._traffic_card.clear();
    }

    override get view() {
        return this._view;
    }

    override get contents() {
        return this._view.webContents;
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

    async collect(kinds, args) {
        await this.refresh();

        for (let kind of kinds) {
            switch (kind) {
                case 'cookie':
                    this._output.cookies = await this._cookie_card.inspect();
                    break;
                case 'https':
                    if (this.contents.getURL()) {
                        await collector_connection.testHttps(this.contents.getURL(), this._output);
                    }
                    break;
                case 'testSSL':

                    this._output.testSSL = await this._test_ssl_card.inspect();
                    this._output.testSSLError = this._test_ssl_card.testSSLError;
                    this._output.testSSLErrorOutput = this._test_ssl_card.testSSLErrorOutput;
                    this._output.testSSLErrorCode = this._test_ssl_card.testSSLErrorCode;
                    //if (!collect.output.uri_ins) return testssl_example;
                    /*if (this.contents.getURL()) {
                        if (args.testssl_type == 'script') {
                            collector_connection.testSSLScript(
                                this.contents.getURL(),
                                args,
                                this.logger,
                                output
                            );
                        } else if (args.testssl_type == 'docker') {
                            collector_connection.testSSLDocker(
                                this.contents.getURL(),
                                args,
                                this.logger,
                                output
                            );
                        } else {
                            output.testSSLError = "Unknow method for testssl, go to settings first.";
                        }

                    } else {
                        output.testSSLError = "No url given to test_ssl.sh";
                    }*/
                    break;
                case 'localstorage':
                    this._output.localStorage = await this._local_storage_card.inspect();
                    break;

                case 'traffic':
                    this._output.hosts = {};
                    this._output.hosts.requests = {};
                    this._output.hosts.requests.thirdParty = this._traffic_card.inspect();
                    break;

                case 'forms':
                    this._output.unsafeForms = await this._unsafe_form_card.inspect();
                    break;

                case 'beacons':
                    this._output.beacons = this._beacon_card.inspect();
                    break;
            }
        }


        return this._output;
    }

    override get isElectron(){
        return true;
    }

    findInHeaders(details, header){
        const cookieHTTPHeader = Object.keys(details.responseHeaders).find(key => key.toLowerCase() === "set-cookie");

        if (cookieHTTPHeader) {
            return details.responseHeaders[cookieHTTPHeader];
        }
        return [];    
    }
    getUrlFromResponse(details : any){
        return details.url;
    }

    override get mainUrl(){
        return this.contents.mainFrame.url;
    }

    override  async cookies(){
        return await this.contents.session.cookies.get({});
    }
}