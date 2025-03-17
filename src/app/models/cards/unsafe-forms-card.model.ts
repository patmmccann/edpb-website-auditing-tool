/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Card } from "../card.model";
import { Details } from "../details.model";

export class UnsafeForm extends Details{
    id:string="";
    action:string="";
    method:string="";

    constructor(id:string, action:string, method:string, idx:number){
        super('unsafeForm', idx);
        this.id = id;
        this.action = action;
        this.method = method;
    }
}


export class UnsafeFormsCard extends Card {
    public unsafeForms: UnsafeForm[] = [];

    constructor(unsafeForms: any[]) {
        super("Web Forms with non-encrypted Transmission", "forms");
        if (!unsafeForms) return;
        unsafeForms.forEach((line:any, idx:number) => {
            this.unsafeForms.push(new UnsafeForm(line.id, line.action, line.method, idx))
        });
    }
}
