/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Card } from "../card.model";
import { Details } from "../details.model";
import { Log } from "./log.model";

export class LocalStorageLine extends Details{
    public host:string
    public key:string;
    public value:string;
    public firstPartyStorage : string[];
    public log:Log | null = null;

    constructor(host:string, key:string, value:any, idx:number){
        super('localstorage', idx);
        this.host = host;
        this.key = key;
        this.value = value.value;
        this.firstPartyStorage = value.firstPartyStorage;
        if (value.log){
            this.log = new Log(value.log);
        }
    }
}

export class LocalStorageCard extends Card {
    public localStorageLines : LocalStorageLine[];

    constructor(name:string){
        super(name, "localstorage");
        this.localStorageLines= [];
    }

    push(line:LocalStorageLine){
        this.localStorageLines.push(line);
    }
}
