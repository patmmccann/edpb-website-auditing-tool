import { CollectorSession } from "../sessions/collector-session";
import { Card } from "./card";
import { Cookie, defaultPath } from "tough-cookie";

import * as url from 'url';
import * as lodash from 'lodash';

export class CookieCard extends Card {

    constructor(collector: CollectorSession) {
        super("cookie-card", collector);
    }

    enable() {
        throw new Error("Method not implemented.");
    }
    disable() {
        throw new Error("Method not implemented.");
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

    inspectCookies (cookies) {

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
        ).filter((cookie :any) => cookie.value); // don't consider deletion events with no value defined

        cookies_from_events.forEach((event_cookie:any) => {
            // we compare the eventlog with what was collected
            let matched_cookie = cookies.find((cookie) => {
                return (
                    cookie.name == event_cookie.key &&
                    cookie.domain == event_cookie.domain &&
                    cookie.path == event_cookie.path
                );
            });

            // if there is a match, we enrich with the log entry
            // else we add a nww entry to the output.cookies array
            if (matched_cookie) {
                matched_cookie.log = event_cookie.log;
            } else {
                const cookie = {
                    name: event_cookie.key,
                    domain: event_cookie.domain,
                    path: event_cookie.path,
                    value: event_cookie.value,
                    expires: event_cookie.expires,
                    log: event_cookie.log,
                    session:false,
                    expiresDays :0
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

    async inspect() {
        const cookies = await this.collector.contents.session.cookies.get({});
        const log_cookies = this.collectCookies(cookies, 0);
        const final = this.inspectCookies(log_cookies);
        return final;
    }

    add(details: Electron.OnHeadersReceivedListenerDetails) {
        const cookieHTTPHeader = Object.keys(details.responseHeaders).find(key => key.toLowerCase() === "set-cookie");
        if (cookieHTTPHeader) {
            const cookieHTTPHeaders = details.responseHeaders[cookieHTTPHeader];
            for (const cookieHTTP of cookieHTTPHeaders) {
                try {
                    const stack = [
                        {
                            fileName: details.url,
                            source: `set in Set-Cookie HTTP response header for ${details.url}`,
                        },
                    ];
                    const domain = new url.URL(details.url).hostname;
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
                            cookie.path = cookie.path || defaultPath(new url.URL(details.url).pathname);
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

                    if (this.logger.writable == false) return;
                    messages.forEach((message) => {
                        this.logger.log("warn", message, {
                            type: "Cookie.HTTP",
                            stack: stack,
                            location: this.collector.contents.mainFrame.url, // or page.url(), // (can be about:blank if the request is issued by browser.goto)
                            raw: cookieHTTP,
                            data: valid,
                        });
                    });
                } catch (error) {
                    this.logger.log("error", error.message, { type: "cookie-card" });
                }
            }
        }
    }

}