/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Collector } from "./collector";
import { TrafficCard } from "../cards/traffic-card";
import { BeaconCard } from "../cards/beacon-card";
import { CookieCard } from "../cards/cookie-card";
import { Har } from "har-format";

export class HarCollector extends Collector {
    _traffic_card: TrafficCard;
    _beacon_card: BeaconCard;
    _cookie_card: CookieCard;
    _har : Har;
    _creator : string;

    constructor(har, settings) {
        super(settings);

        this._har = har;
        this._creator = har.log.creator.name;
        this._traffic_card = new TrafficCard(this);
        this._beacon_card = new BeaconCard(this);
        this._cookie_card = new CookieCard(this);
        
    } 
      
    async parseHar(){
        
        for (let entry of this._har.log.entries) {
            this._traffic_card.add(entry.request as any);
            this._beacon_card.add(entry.request as any);
            this._cookie_card.add(entry.response as any);
        }

        async function waitForComplete (logger) {
            return new Promise(async function (resolve, reject) {
              logger.log("info", "ending", { type: "logger"});
              async function waitForLogger(){
                let event_end_data :any = await new Promise((resolve, reject) => {
                  logger.query(
                    {
                      start: 0,
                      order: "desc",
                      limit: Infinity,
                    },
                    (err, results) => {
                      console.log("error with logger")
                      if (err) return reject(err);
                      return resolve(results.file);
                    }
                  );
                });
                const end_event = event_end_data.filter((event) => 
                  event.level == 'info' && event.message == 'ending'
                )
                if (end_event.length >0){
                  resolve(null)
                }else{
                  setTimeout(waitForLogger, 100);
                } 
              }
          
              setTimeout(waitForLogger, 100);
            });
          }

        await waitForComplete(this.logger);
        await this.refresh();

        const output: any = {};

        await this._cookie_card.inspect(output);
        this._traffic_card.inspect(output);
        this._beacon_card.inspect(output);

        return output;
    }

    getTopLevelUrl(details) {
        const har = this._har;
        if (details._initiator){
            if (details._initiator.url){
                return details._initiator.url;
            }
    
            if (details._initiator.stack){
                const stack = details._initiator.stack
                if (stack.callFrames.length > 0){
                    return stack.callFrames.pop().url;
                }
               
            }
        }
        

        const pageref = details.pageref;
        const pages = har.log.pages;
        const page =  pages.find(x => x.id == pageref)

        return page.title;
    }

    sourceUrl(page : string){
        return "";
    }

    getDetailsFromRequest(request:any){
        const entries = this._har.log.entries;

        return entries.find(x => x.request == request);

    }

    getDetailsFromResponse(response:any){
        const entries = this._har.log.entries;

        return entries.find(x => x.response == response);

    }

    override get isHar(){
        return true;
    }

    findInHeaders(details, header){

        return details.headers
        .filter(x => x.name.toLowerCase() === header)
        .map(x =>x.value);
    }
    
    getUrlFromResponse(response : any){
        const details = this.getDetailsFromResponse(response);
        return details.request.url;
    }

    override get mainUrl(){
        return this._har.log.pages[0].title;
    }

    override  async cookies(){
        const cookies = new Set();
        for (const entry of this._har.log.entries){
            for (const cookie of entry.request.cookies){
                cookies.add(JSON.stringify(cookie));
            }
            
        }
        return Array.from(cookies)
        .map((x:string) => JSON.parse(x));
    }
}