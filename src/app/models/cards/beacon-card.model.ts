/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Card } from "../card.model";
import { Details } from "../details.model";
import { Log } from "./log.model";
import { RequestTrackingLog } from "./request-tracking-log.model";

export class BeaconLine extends Details{
    public filter :string;
    public listName : string;
    public query : any;
    public url : string;
    public log : Log | null = null;
    public occurrances : number;

    constructor(beacon:any, idx:number){
        super('beacon', idx);
        this.filter =beacon.filter;
        this.listName = beacon.listName;
        this.query = beacon.query;
        this.url = beacon.url;
        if (beacon.log){
            this.log = new RequestTrackingLog(beacon.log);
        }
        this.occurrances = beacon.occurrances;
    }
}


export class BeaconCard extends Card {
    public beaconLines : BeaconLine[];

    constructor(){
        super("Beacons", "beacons");
        this.beaconLines = [];
    }

    push(line:BeaconLine){
        this.beaconLines.push(line);
    }
}
