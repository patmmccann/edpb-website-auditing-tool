
import * as url from 'url';
import { Collector } from "../collectors/collector";
import {Card} from "./card";

export class TrafficCard extends Card{
    _callback = null;

    enable() {
        this._callback = this.add.bind(this);
        this.collector.onBeforeRequestCallbacks.push(this._callback);
    }
    disable() {
        const index = this.collector.onBeforeRequestCallbacks.indexOf(this._callback);
        this.collector.onBeforeRequestCallbacks.splice(index, 1);
        this._callback = null;
    }
    _hosts = new Set();
    
    constructor(collector : Collector){
        super("traffic", collector);
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

    inspect(output){
        output.hosts = {};
        output.hosts.requests = {};
        output.hosts.requests.thirdParty =  Array.from(this._hosts);
    }
}