
import * as url from 'url';
import { Collector } from "../collectors/collector";
import {Card} from "./card";

export class TrafficCard extends Card{
    enable() {
        throw new Error('Method not implemented.');
    }
    disable() {
        throw new Error('Method not implemented.');
    }
    _hosts = new Set();
    
    constructor(collector : Collector){
        super("traffic-card", collector);
    }  

    add(details : Electron.OnBeforeRequestListenerDetails){
        try {
            const l = url.parse(details.url);
            if (l.protocol != "data:") {
                this._hosts.add(l.hostname);
            }
        }catch(error){
            if (this.logger.writable == false) return;
            this.logger.log("error", error.message, { type: "traffic-card" });
        }
    }

    override clear(){
        this._hosts = new Set();
    }

    inspect(){
        return Array.from(this._hosts);
    }
}