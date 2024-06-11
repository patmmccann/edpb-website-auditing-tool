import { Log } from "./log.model";

export interface RequestTrackingEvent {
    filter : string;
    listName : string;
}

export class RequestTrackingLog extends Log{
    event : RequestTrackingEvent | null = null;
    constructor(logs:any){
        super(logs);
        if(logs.event){
            this.event = {} as RequestTrackingEvent;
            this.event.filter = logs.event.filter;
            this.event.listName = logs.event.listName;
        }
    }
}
