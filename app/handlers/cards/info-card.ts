/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 * 
 */

import { Collector } from "../collectors/collector";
import {Card} from "./card";
import { app} from 'electron';
export class InfoCard extends Card{
    tool_version;
    chrome_version;
    user_agent;
    visited_urls;
    start_time;
    end_time;

    constructor(collector: Collector) {
        super("info", collector);

        this.tool_version = app.getVersion();
        this.chrome_version = process.versions.chrome;
        this.visited_urls = new Set();
    }
    
    override inspect(output: any) {
        output.info = {
            tool_version : this.tool_version,
            chrome_version : this.chrome_version,
            visited_urls : Array.from(this.visited_urls)
        }

        if (this.collector.contents){
            output.info.user_agent = this._collector.contents.getUserAgent();
        }
    }

    enable() {
        if (this.collector.isElectron){
            this.collector.contents.on('did-finish-load', () => {
                this.visited_urls.add(this.collector.mainUrl);
            });
        }
        
    }
    disable() {

    }

}