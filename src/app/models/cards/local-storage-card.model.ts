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
    public log:Log;

    constructor(host:string, key:string, value:any){
        super('localstorage');
        this.host = host;
        this.key = key;
        this.value = value.value;
        this.firstPartyStorage = value.firstPartyStorage;
        this.log = new Log(value.log);
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

    override get help():string {
        return "Pairs of keys and values stored in the browser local storage on the current displayed pagew ith their potential purposes from the knowledge base. Click on header to sort key and values and on a line to get more detailed on a specific key."
    } 
}
