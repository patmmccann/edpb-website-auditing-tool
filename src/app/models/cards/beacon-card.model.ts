/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Card } from "../card.model";
import { Details } from "../details.model";
import { RequestTrackingLogEvent } from "./log-event.model";

export class BeaconLine extends Details{
    public filter :string;
    public listName : string;
    public query : any;
    public url : string;
    public event : RequestTrackingLogEvent | null = null;
    public occurrances : number;

    constructor(beacon:any){
        super('beacon');
        this.filter =beacon.filter;
        this.listName = beacon.listName;
        this.query = beacon.query;
        this.url = beacon.url;
        this.event = new RequestTrackingLogEvent(beacon);
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
