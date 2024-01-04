import { Collector } from "../collectors/collector";
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
    _local_storage_logger = null;
    _timeout = null;
    _cancel_timeout = false;
    _local_storage = null;

    constructor(collector: Collector) {
        super("local-storage-card", collector);
    }

    enable() {
      this._local_storage_logger = this.register_event_logger;
      this.collector.event_logger[this._local_storage_logger.type] = this._local_storage_logger.logger;
      this._timeout = setTimeout(this.getLocalStorage.bind(this), 2000);
    }

    disable() {
      this.collector.event_logger[this._local_storage_logger.type] = null;
      this._local_storage_logger = null;

      if(this._timeout == null){
        this._cancel_timeout = true;
      }else {
        clearTimeout(this._timeout);
        this._timeout = null;
      }
    }

    override clear() {
      this._local_storage = null;
    }
    
    async inspect() {
        if(this._local_storage == null) return {};
        const localStorage = structuredClone(this._local_storage);
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
        this._timeout = null;

        const data :any = {};
        let allframes;
        try {
          allframes = this.contents.mainFrame.framesInSubtree;
        } catch (error :any) {
            if (this.logger.writable == false) return;
            // ignore error if no localStorage for given origin can be
            // returned, see also: https://stackoverflow.com/q/62356783/1407622
            this.logger.log("warn", error.message, { type: "Browser" });
            return data;
        }
        
        for (const frame of allframes) {
          try {
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
            if (this.logger.writable == false) return;
            this.logger.log("warn", error.message, { type: "Browser" });
          }
        }
        this._local_storage = data;
        if (!this._cancel_timeout) {
          this._timeout = setTimeout(this.getLocalStorage.bind(this), 2000);
        }
      };

      event_logger_data(event, location){
        event.data = {};
        for (const key of Object.keys(event.raw)) {
          event.data[key] = safeJSONParse(event.raw[key]);
        }

        return `LocalStorage filled with key(s) ${Object.keys(
          event.raw
        )} for origin ${location.origin}.`;
      }

      get register_event_logger(){
          return {type:"Storage.LocalStorage", logger : this.event_logger_data};
      }
}