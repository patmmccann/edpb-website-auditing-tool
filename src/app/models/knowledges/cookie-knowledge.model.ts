/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Knowledge } from "../knowledge.model";

export class CookieKnowledge extends Knowledge{
    public domain: string = ""; 
    public name: string = "";
    public category: string = "";
    public source: string = "";
    public controller: string = "";
    public date: string = "";
    public policy: string = "";
    public reference: string = "";
    public comment: string = "";
    
    constructor(){
        super('cookie');
    }
}
