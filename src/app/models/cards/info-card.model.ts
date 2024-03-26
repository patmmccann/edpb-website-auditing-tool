/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Card } from "../card.model";

export class InfoCard extends Card{
    url:string ="";
    chrome_version :string = "";
    tool_version :string = "";
    user_agent :string = "";
    visited_urls :string[]=[];
    
    constructor(value:any){
        super("Browser informations", "info");
        if (!value) return;
        this.chrome_version = value.chrome_version;
        this.tool_version = value.tool_version;
        this.user_agent = value.user_agent;
        this.visited_urls = value.visited_urls;
    }

}
