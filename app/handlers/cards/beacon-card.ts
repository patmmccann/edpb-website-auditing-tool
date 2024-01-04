import { Collector } from "../collectors/collector";
import { Card } from "./card";
import { PuppeteerBlocker } from '@cliqz/adblocker-puppeteer';
import { Request } from '@cliqz/adblocker';

import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';
import * as lodash from 'lodash';
import { HarCollector } from "../collectors/har-collector";
import { BrowserCollector } from "../collectors/browser-collector";

// The following options make sure that blocker will behave optimally for the
// use-case of identifying blocked network requests as well as the rule which
// triggered blocking in the first place.
const blockerOptions = {
    // This makes sure that the instance of `PuppeteerBlocker` keeps track of the
    // exact original rule form (from easylist or easyprivacy). Otherwise some
    // information might be lost and calling `toString(...)` will only give back
    // an approximate version.
    debug: true,

    // By default, instance of `PuppeteerBlocker` will perform some dynamic
    // optimizations on rules to increase speed. As a result, it might not always
    // be possible to get back the original rule which triggered a 'match' for
    // a specific request. Disabling these optimizations will always ensure we
    // can know which rule triggered blocking.
    enableOptimizations: false,

    // We are only interested in "network rules" to identify requests which would
    // be blocked. Disabling "cosmetic rules" allows to resources.
    loadCosmeticFilters: false,
};

// setup easyprivacy matching
// https://github.com/cliqz-oss/adblocker/issues/123
let blockers = {
    "easyprivacy.txt": PuppeteerBlocker.parse(
        fs.readFileSync(path.join(__dirname, "../../../assets/easyprivacy.txt"), "utf8"),
        blockerOptions
    ),
    "fanboy-annoyance.txt": PuppeteerBlocker.parse(
        fs.readFileSync(
            path.join(__dirname, "../../../assets/fanboy-annoyance.txt"),
            "utf8"
        ),
        blockerOptions
    ),
};

export class BeaconCard extends Card {
    _callback = null;

    constructor(collector: Collector) {
        super("beacons", collector);
    }

    override enable() {
        this._callback = this.add.bind(this);
        this.collector.onBeforeRequestCallbacks.push(this._callback);
    }
    override disable() {
        const index = this.collector.onBeforeRequestCallbacks.indexOf(this._callback);
        this.collector.onBeforeRequestCallbacks.splice(index, 1);
        this._callback = null;
    }

    override inspect(output) {
        const eventData = this.collector.event_data;
        const beacons_from_events = lodash.flatten(
            eventData
                .filter((event) => {
                    return event.type.startsWith("Request.Tracking");
                })
                .map((event) => {
                    return Object.assign({}, event.data, {
                        log: {
                            stacks: event.stack,
                            // type: event.type,
                            timestamp: event.timestamp,
                        },
                    });
                })
        );

        const beacons_from_events_grouped = lodash.groupBy(beacons_from_events, (beacon: any) => {
            let url_parsed = url.parse(beacon.url);
            return `${url_parsed.hostname}${url_parsed.pathname.replace(/\/$/, "")}`;
        });

        const beacons_summary = [];
        for (const [key, beacon_group] of Object.entries(
            beacons_from_events_grouped
        )) {
            beacons_summary.push(
                Object.assign({}, beacon_group[0], {
                    occurrances: beacon_group.length,
                })
            );
        }

        beacons_summary.sort((b1, b2) => {
            return b2.occurances - b1.occurances;
        });

        output.beacons= beacons_summary;
    }

    fromElectronDetails(details: Electron.OnBeforeRequestListenerDetails) {
        const electronCollector = this.collector as BrowserCollector;
        const sourceUrl = electronCollector.getTopLevelUrl(details);
        const url = details.url;
        const type = details.resourceType as any;
        return Request.fromRawDetails({
            _originalRequestDetails: details,
            requestId: `${type}-${url}-${sourceUrl}`,
            sourceUrl,
            type,
            url,
        });
    }

    fromHarDetails(request: any) {
        const harCollector = this.collector as HarCollector;
        const details = harCollector.getDetailsFromRequest(request);
        const sourceUrl = harCollector.getTopLevelUrl(details);
        const url = details.request.url;
        const type = details._resourceType as any;
        return Request.fromRawDetails({
            _originalRequestDetails: details,
            requestId: `${type}-${url}-${sourceUrl}`,
            sourceUrl,
            type,
            url,
        });
    }

    add(details: Electron.OnBeforeRequestListenerDetails) {
        function safeJSONParse(obj) {
            try {
                return JSON.parse(obj);
            } catch (e) {
                return obj;
            }
        };

        function decodeURLParams(search) {
            const hashes = search.slice(search.indexOf("?") + 1).split("&");
            return hashes.reduce((params, hash) => {
                const split = hash.indexOf("=");

                if (split < 0) {
                    return Object.assign(params, {
                        [hash]: null,
                    });
                }

                const key = hash.slice(0, split);
                const val = hash.slice(split + 1);

                try {
                    return Object.assign(params, { [key]: decodeURIComponent(val) });
                } catch {
                    return Object.assign(params, { [key]: val });
                }

            }, {});
        };

        

        // prepare easyprivacy list matching
        Object.entries(blockers).forEach(([listName, blocker]) => {
            try {
                const {
                    match, // `true` if there is a match
                    filter, // instance of NetworkFilter which matched
                } = blocker.match(this.collector.isElectron ? this.fromElectronDetails(details):
                                  this.collector.isHar ? this.fromHarDetails(details):
                                  Request.fromRawDetails({})
                );
    
                if (match) {
                    let stack = [
                        {
                            fileName: details.frame?.url, //TODO : Get source from HAR
                            source: `requested from ${details.frame?.url || "undefined source"
                                } and matched with ${listName} filter ${filter}`,
                        },
                    ];
    
                    const parsedUrl = url.parse(details.url);
                    let query = null;
                    if (parsedUrl.query) {
                        query = decodeURLParams(parsedUrl.query);
                        for (let param in query) {
                            query[param] = safeJSONParse(query[param]);
                        }
                    }
                    let message = `Potential Tracking Beacon captured via ${listName} with endpoint ${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}.`;
                    if (this.logger.writable == false) return;
                    this.logger.log("warn", message, {
                        type: "Request.Tracking",
                        stack: stack,
                        data: {
                            url: details.url,
                            query: query,
                            filter: filter.toString(),
                            listName: listName,
                        },
                    });
                }
            }catch (error) {
                if (this.logger.writable == false) return;
                this.logger.log("error", error.message, { type: "beacon-card" });
            }
        });
    }
}