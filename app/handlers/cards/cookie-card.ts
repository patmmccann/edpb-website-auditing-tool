/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 * 
 * Based on https://github.com/EU-EDPS/website-evidence-collector/blob/master/inspector/index.js and
 * https://github.com/EU-EDPS/website-evidence-collector/blob/master/collector/inspector.js
 * from the Website Evidence Collector (https://github.com/EU-EDPS/website-evidence-collector)
 */
import { Collector } from "../collectors/collector";
import { Card } from "./card";
import { Cookie, defaultPath } from "tough-cookie";

import * as url from 'url';
import * as lodash from 'lodash';

export class CookieCard extends Card {
    _callback = null;
    _cookie_logger = null;

    constructor(collector: Collector) {
        super("cookie", collector);
    }

    enable() {
        this._callback = this.add.bind(this);
        this.collector.onHeadersReceivedCallbacks.push(this._callback);
        this._cookie_logger = this.register_event_logger;
        this.collector.event_logger[this._cookie_logger.type] = this._cookie_logger.logger;
    }
    disable() {
        const index = this.collector.onBeforeRequestCallbacks.indexOf(this._callback);
        this.collector.onBeforeRequestCallbacks.splice(index, 1);
        this._callback = null;
        this.collector.event_logger[this._cookie_logger.type] = null;
        this._cookie_logger = null;
    }

    collectCookies(cookies, start_time) {
        // example from https://stackoverflow.com/a/50290081/1407622
        return cookies
            .filter((cookie) => {
                // work-around: Chromium retains cookies with empty name and value
                // if web servers send empty HTTP Cookie Header, i.e. "Set-Cookie: "
                return cookie.name != "";
            })
            .map((cookie) => {
                if (cookie.expirationDate > -1) {
                    // add derived attributes for convenience
                    cookie.expiresUTC = new Date(cookie.expirationDate * 1000);
                    cookie.expiresDays =
                        Math.round((cookie.expiresUTC - start_time) / (10 * 60 * 60 * 24)) /
                        100;
                }

                if (cookie.domain) {
                    cookie.domain = cookie.domain.replace(/^\./, ""); // normalise domain value
                }


                return cookie;
            });
    }

    inspectCookies(cookies) {

        // we get all cookies from the log, which can be both JS and http cookies
        let cookies_from_events = lodash.flatten(
            this.collector.event_data
                .filter((event) => {
                    return event.type.startsWith("Cookie");
                })
                .map((event) => {
                    event.data.forEach((cookie) => {
                        cookie.log = {
                            stack: event.stack,
                            type: event.type,
                            timestamp: event.timestamp,
                            location: event.location,
                        };
                    });
                    return event.data;
                })
        ).filter((cookie: any) => cookie.value); // don't consider deletion events with no value defined

        cookies_from_events.forEach((event_cookie: any) => {
            // we compare the eventlog with what was collected
            let matched_cookie = cookies.find((cookie) => {
                return (
                    cookie.name == event_cookie.key &&
                    cookie.domain == event_cookie.domain &&
                    cookie.path == event_cookie.path
                );
            });

            let log = {};

            if (event_cookie && event_cookie.log){
                //Retrieve raw value of log
                log = event_cookie.log;
                delete event_cookie.log;
                log["event"] = event_cookie;
            }

            if (matched_cookie) {
                matched_cookie.log = log;
            } else {
                // In case of no matching entries 
                const cookie = {
                    name: event_cookie.key,
                    value: event_cookie.value,
                    expiresUTC: event_cookie.expires,
                    maxAge: event_cookie.maxAge,
                    domain: event_cookie.domain,
                    path: event_cookie.path,
                    secure: event_cookie.secure == null ? false : event_cookie.secure,
                    httpOnly: event_cookie.httpOnly == null ? false : event_cookie.httpOnly,
                    sameSite: event_cookie.sameSite == null ? "unspecified" : event_cookie.sameSite,
                    event: event_cookie,
                    log : log,
                    session: false,
                    expiresDays: 0,
                    expires: event_cookie.expires
                };

                if (!event_cookie.expires) {
                    cookie.expires = -1;
                    cookie.session = true;
                } else {
                    cookie.expiresDays = Math.round((new Date(event_cookie.expires).getTime() - new Date(event_cookie.creation).getTime()) / (10 * 60 * 60 * 24)) / 100;
                    cookie.session = false;
                }
                cookies.push(cookie);
            }
        });

        // finally we sort the cookies based on expire data - because ?
        return cookies.sort(function (a, b) {
            return b.expires - a.expires;
        });
    }

    async inspect(output) {
        const cookies = await this.collector.cookies();
        const log_cookies = this.collectCookies(cookies, 0);
        const final = this.inspectCookies(log_cookies);
        output.cookies = final;
    }

    add(details: Electron.OnHeadersReceivedListenerDetails) {

        const cookieHTTPHeaders = this.collector.findInHeaders(details, "set-cookie");
        for (const cookieHTTP of cookieHTTPHeaders) {
            try {
                const request_url = this.collector.getUrlFromResponse(details);
                const stack = [
                    {
                        fileName: request_url,
                        source: `set in Set-Cookie HTTP response header for ${details.url}`,
                    },
                ];
                const domain = new url.URL(request_url).hostname;
                const data = cookieHTTP
                    .split("\n")
                    .map((c) => {
                        return Cookie.parse(c) || { value: c };
                    })
                    .map((cookie) => {
                        // what is the domain if not set explicitly?
                        // https://stackoverflow.com/a/5258477/1407622
                        cookie.domain = cookie.domain || domain;

                        // what if the path is not set explicitly?
                        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes
                        // https://github.com/salesforce/tough-cookie#defaultpathpath
                        cookie.path = cookie.path || defaultPath(new url.URL(request_url).pathname);
                        return cookie;
                    });

                const dataHasKey = lodash.groupBy(data, (cookie) => {
                    return !!cookie.key;
                });
                const valid = dataHasKey.true || [];
                const invalid = dataHasKey.false || [];

                const messages = [
                    `${valid.length} Cookie(s) (HTTP) set for host ${domain}${valid.length ? " with key(s) " : ""
                    }${valid.map((c) => c.key).join(", ")}.`,
                ];
                if (invalid.length) {
                    messages.push(
                        `${invalid.length
                        } invalid cookie header(s) set for host ${domain}: "${invalid
                            .map((c) => c.value)
                            .join(", ")}".`
                    );
                }

                messages.forEach((message) => {
                    if (this.logger.writable == false) return;
                    this.logger.log("warn", message, {
                        type: "Cookie.HTTP",
                        stack: stack,
                        location: this.collector.mainUrl, // or page.url(), // (can be about:blank if the request is issued by browser.goto)
                        raw: cookieHTTP,
                        data: valid,
                    });
                });
            } catch (error) {
                if (this.logger.writable == false) return;
                this.logger.log("error", error.message, { type: "cookie-card" });
            }
        }
    }

    event_logger_data(event, location) {
        const cookie = Cookie.parse(event.raw);

        // what is the domain if not set explicitly?
        // https://stackoverflow.com/a/5258477/1407622
        cookie.domain = cookie.domain || location.hostname;

        // what if the path is not set explicitly?
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes
        // https://github.com/salesforce/tough-cookie#defaultpathpath
        // TODO How can be sure that browsedLocation corresponds to the JS execution context when cookie is set?
        cookie.path = cookie.path || defaultPath(url.parse(event.location).pathname);

        event.data = [cookie];

        return `${event.data[0].expires ? "Persistant" : "Session"
            } Cookie (JS) set for host ${event.data[0].domain} with key ${event.data[0].key
            }.`;
    }

    get register_event_logger() {
        return { type: "Cookie.JS", logger: this.event_logger_data };
    }

}