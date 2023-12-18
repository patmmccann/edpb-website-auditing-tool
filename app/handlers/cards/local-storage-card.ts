import { CollectorSession } from "../sessions/collector-session";
import { Card } from "./card";

import * as url from 'url';

function safeJSONParse(obj:any) {
  try {
      return JSON.parse(obj);
  } catch (e) {
      return obj;
  }
};

export class LocalStorageCard extends Card {

    constructor(collector: CollectorSession) {
        super("local-storage-card", collector);
    }

    enable() {
        throw new Error("Method not implemented.");
    }
    disable() {
        throw new Error("Method not implemented.");
    }
    async inspect() {
        const localStorage = await this.getLocalStorage();
        await this.inspectLocalStorage(localStorage);
        return localStorage;
    }

    async inspectLocalStorage (local_storage:any) {
        let storage_from_events = this.collector.event_data.filter((event) => {
          return event.type.startsWith("Storage");
        });
    
        Object.keys(local_storage).forEach((origin) => {
          let originStorage = local_storage[origin];
          Object.keys(originStorage).forEach((key) => {
            // find log for a given key
            let matched_event = storage_from_events.find((event) => {
              return (
                origin == event.origin && Object.keys(event.data).includes(key)
              );
            });
    
            if (!!matched_event) {
              originStorage[key].log = {
                stack: matched_event.stack,
                type: matched_event.type,
                timestamp: matched_event.timestamp,
                location: matched_event.location,
              };
            }
          });
        });
      };

    async getLocalStorage () {
        const data :any = {};
        let allframes;
        try {
          allframes = this.contents.mainFrame.framesInSubtree;
        } catch (error :any) {
            // ignore error if no localStorage for given origin can be
            // returned, see also: https://stackoverflow.com/q/62356783/1407622
            this.logger.log("warn", error.message, { type: "Browser" });
            return data;
        }
        
        for (const frame of allframes) {
          try {
            // it is unclear when the following url values occur:
            // potentially about:blank is the frame before the very first page is browsed
            if (!frame.url.startsWith("http")) {
              continue; // filters chrome-error://, about:blank and empty url
            }
      
            const securityOrigin = new url.URL(frame.url).origin;
            const response :any = await frame.executeJavaScript('Object.keys(localStorage).map(key=>[key,localStorage.getItem(key)])');
      
            if (response && response.length > 0) {
              let entries :any = {};
              for (const entry of response) {
                const key = entry[0];
                const val = entry[1];
                entries[key] = {
                  value: safeJSONParse(val),
                };
              }
              // console.log(response.entries);
              data[securityOrigin] = Object.assign({}, data[securityOrigin], entries);
            }
          } catch (error :any) {
            // ignore error if no localStorage for given origin can be
            // returned, see also: https://stackoverflow.com/q/62356783/1407622
            this.logger.log("warn", error.message, { type: "Browser" });
          }
        }
        return data;
      };

      event_logger(event, location){
        const message = `LocalStorage filled with key(s) ${Object.keys(
          event.raw
        )} for origin ${location.origin}.`;

        event.data = {};
        for (const key of Object.keys(event.raw)) {
          event.data[key] = safeJSONParse(event.raw[key]);
        }

        if (this.logger.writable == false) return;
        this.logger.log("warn", message, event);
      }

      get register_event_logger(){
          return {type:"Storage.LocalStorage", logger : this.event_logger.bind(this)};
      }
}