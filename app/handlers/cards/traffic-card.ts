
import * as url from 'url';
import { CollectorSession } from '../sessions/collector-session';
import {Card} from "./card";

export class TrafficCard extends Card{
    enable() {
        throw new Error('Method not implemented.');
    }
    disable() {
        throw new Error('Method not implemented.');
    }
    _hosts = new Set();
    
    constructor(collector : CollectorSession){
        super("traffic-card", collector);
    }  

    add(details : Electron.OnBeforeRequestListenerDetails){
        try {
            const l = url.parse(details.url);
            if (l.protocol != "data:") {
                this._hosts.add(l.hostname);
            }
        }catch(error){
            this.logger.log("error", error.message, { type: "traffic-card" });
        }
    }

    clear(){
        this._hosts = new Set();
    }

    inspect(){
        return Array.from(this._hosts);
    }
}