/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Card } from "../card.model";
import { Details } from "../details.model";
import { Log } from "./log.model";

export class CookieLine extends Details{
    public name: string;
    public value: string;
    public domain: string;
    public path: string;
    public expires: number;
    public size: number;
    public httpOnly: boolean;
    public secure: boolean;
    public session: boolean;
    public sameSite: string;
    public priority: string;
    public sameParty: boolean;
    public sourceScheme:string;
    public sourcePort: number;
    public expiresUTC: string;
    public expiresDays: number;
    public firstPartyStorage:boolean;
    public log: Log;

    constructor(cookie:any){
        super('cookie');
        this.name =cookie.name;
        this.value = cookie.value;
        this.domain = cookie.domain;
        this.path = cookie.path;
        this.expires= cookie.expires;
        this.size= cookie.size;
        this.httpOnly= cookie.httpOnly;
        this.secure= cookie.secure;
        this.session= cookie.session;
        this.sameSite= cookie.sameSite;
        this.priority= cookie.priority;
        this.sameParty= cookie.sameParty;
        this.sourceScheme=cookie.sourceScheme;
        this.sourcePort= cookie.sourcePort;
        this.expiresUTC= cookie.expiresUTC;
        this.expiresDays= cookie.expiresDays;
        this.firstPartyStorage = cookie.firstPartyStorage;
        this.log = new Log(cookie.log);
    }
}


export class CookieCard extends Card {
    public cookieLines: CookieLine[];


    constructor(name: string) {
        super(name, "cookie");
        this.cookieLines = [];
    }

    push(line: CookieLine) {
        this.cookieLines.push(line);
    }

    contains(line: CookieLine) {
        return this.cookieLines.some(l => l.name == line.name && l.value == line.value && l.domain == line.domain)
    }
}
