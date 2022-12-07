import { Card } from "../card.model";
import { Details } from "../details.model";
import { Log } from "./log.model";

export class BeaconLine extends Details{
    public filter :string;
    public listName : string;
    public query : any;
    public url : string;
    public log : Log;
    public occurrances : number;

    constructor(beacon:any){
        super('beacon');
        this.filter =beacon.filter;
        this.listName = beacon.listName;
        this.query = beacon.query;
        this.url = beacon.url;
        this.log = beacon.log;
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


    override get help():string  {
        return "Positive matchs to adverts and tracking signatures compiled from EasyPrivacy and Fanboy's Annoyance list. This list may include false positives and may be incomplete due to inaccurate, outdated or incomplete signature lists."
    } 
}
