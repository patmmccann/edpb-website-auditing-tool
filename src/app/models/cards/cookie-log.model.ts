import { Log } from "./log.model";

export interface CookieEvent {
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
}

export class CookieLog extends Log{
    event : CookieEvent | null = null;

    constructor(logs:any){
        super(logs);
        if(logs.event){
            this.event = {} as CookieEvent;
            this.event.creation = logs.event.creation;
            this.event.domain = logs.event.domain;
            this.event.expires = logs.event.expires;
            this.event.httpOnly = logs.event.httpOnly;
            this.event.key = logs.event.key;
            this.event.path = logs.event.path;
            this.event.secure = logs.event.secure;
            this.event.value = logs.event.value;
            this.event.maxAge = logs.event.maxAge;
            this.event.hostOnly = logs.event.hostOnly;
            this.event.pathIsDefault = logs.event.pathIsDefault;
            this.event.lastAccessed = logs.event.lastAccessed;
            this.event.sameSite = logs.event.sameSite;
        }
    }
}
