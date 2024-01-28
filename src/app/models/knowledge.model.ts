/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

export type kindKnowledge = 
'cookie' |
'localstorage' |
null;

export class Knowledge {
    public id: number =0;
    public knowledge_base_id: number =0;
    public updated_at: Date = new Date();
    public created_at: Date = new Date();    
    public kind: kindKnowledge;
    constructor(kind : kindKnowledge){
        this.kind = kind;
    }
}
