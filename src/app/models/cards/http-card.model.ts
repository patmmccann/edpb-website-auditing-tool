/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Card } from "../card.model";

export class HTTPCard extends Card {
    https_redirect : boolean |null = null;
    redirects : string | null = null;
    https_support: boolean | null = null;
    https_error:string | null = null;
    http_error:string  | null = null;
    constructor(
    value : any
    ){
        super("Use of HTTPS/SSL", "https");
        if (!value) return;
        this.https_redirect = value.https_redirect,
        this.redirects =  value.redirects,
        this.https_support=  value.https_support,
        this.https_error =  value.https_error,
        this.http_error=  value.http_error
    }
}
