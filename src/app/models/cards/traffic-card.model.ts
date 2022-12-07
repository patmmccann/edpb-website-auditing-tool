import { Card } from "../card.model";

export class TrafficCard extends Card{
    public requests : { [key: string]: string[]} = {};
    public beacons : { [key: string]: string[]} = {};
    public cookies : { [key: string]: string[]} = {};
    public localStorage : { [key: string]: string[]} = {};
    public links : { [key: string]: string[]} = {};

    constructor(value : any){
        super("Traffic Analysis", "traffic");
        if (!value) return;
        this.requests =  value.requests;
        this.beacons =  value.beacons;
        this.cookies = value.cookies;
        this.localStorage = value.localStorage;
        this.links = value.links;
    }

    override get help():string {
        return "List of hosts that received at least one request during the browsing session."
    } 
}
