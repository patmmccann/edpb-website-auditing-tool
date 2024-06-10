import { Log } from "./log.model";


export type LogModels = CookieLogEvent | RequestTrackingLogEvent | RequestTrackingLogEvent | StorageLocalStorageLogEvent | LogEvent;
type LogType = "Cookie.HTTP" | "Cookie.JS" | "Request.Tracking" | "Storage.LocalStorage" | "";

/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
export class LogEvent {
    log : Log = new Log(null);
    type : LogType = "";

    constructor(type : LogType, log: any){
        this.type = type;
        this.log = new Log(log);
    }
}

export class CookieLogEvent extends LogEvent {

    //From tough cookie
    key: string;
    value: string;
    expires: Date | "Infinity";
    maxAge: number | "Infinity" | "-Infinity";
    domain: string | null;
    path: string | null;
    secure: boolean;
    httpOnly: boolean;
    creation: Date | null;
    hostOnly: boolean | null;
    pathIsDefault: boolean | null;
    lastAccessed: Date | null;
    sameSite: string;

    constructor(event : any){
        super(event.log.type, event.log);
        this.creation = event.creation;
        this.domain = event.domain;
        this.expires = event.expires;
        this.httpOnly = event.httpOnly;
        this.key = event.key;
        this.path = event.path;
        this.secure = event.secure;
        this.value = event.value;
        this.maxAge = event.maxAge;
        this.hostOnly = event.hostOnly;
        this.pathIsDefault = event.pathIsDefault;
        this.lastAccessed = event.lastAccessed;
        this.sameSite = event.sameSite;
    }

}


export class RequestTrackingLogEvent extends LogEvent {
    filter : string;
    listName : string;

    constructor(event : any){
        super("Request.Tracking", event.log);
        this.filter = event.filter;
        this.listName = event.listName;
    }
}

export class StorageLocalStorageLogEvent extends LogEvent {
    origin : string;
    raw : any;
    timestamp : string;
    constructor(event : any){
        super("Storage.LocalStorage", event);
        this.origin = event.origin;
        this.raw = event.raw;
        this.timestamp = event.timestamp;
    }
}
