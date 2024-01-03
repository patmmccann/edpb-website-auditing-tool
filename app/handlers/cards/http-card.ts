
import * as url from 'url';
import { Collector } from "../collectors/collector";
import { Card } from "./card";
const wrapper = require("./../../../tools/wrapper");

export class HTTPCard extends Card {
    enable() {
        throw new Error('Method not implemented.');
    }
    disable() {
        throw new Error('Method not implemented.');
    }

    constructor(collector: Collector) {
        super("http-card", collector);
    }

    override clear() {
        throw new Error('Method not implemented.');
    }

    async inspect() {
        const secure_connection: any = {};

        try {
            const uri_ins_https = new url.URL(this.collector.contents.getURL());

            const got = await wrapper.gotWrapper();

            
            uri_ins_https.protocol = "https:";
            await got.got(uri_ins_https, {
                followRedirect: false,
            });
            secure_connection.https_support = true;

        } catch (error) {
            secure_connection.https_support = false;
            secure_connection.https_error = error.toString();
        }
        // test if server redirects http to https
        try {
            const uri_ins_http = new url.URL(this.collector.contents.getURL());
            const got = await wrapper.gotWrapper();
            uri_ins_http.protocol = "http:";

            let res = await got.got(uri_ins_http, {
                followRedirect: true,
                // ignore missing/wrongly configured SSL certificates when redirecting to
                // HTTPS to avoid reporting SSL errors in the output field http_error
                https: {
                    rejectUnauthorized: false,
                },
            });

            secure_connection.redirects = res.redirectUrls.map(x => x.toString());

            if (secure_connection.redirects.length > 0) {
                let last_redirect_url = new url.URL(
                    secure_connection.redirects[
                    secure_connection.redirects.length - 1
                    ]
                );
                secure_connection.https_redirect =
                    last_redirect_url.protocol.includes("https");
            } else {
                secure_connection.https_redirect = false;
            }
        } catch (error) {
            secure_connection.http_error = error.toString();
        }
        return secure_connection;
    }
}