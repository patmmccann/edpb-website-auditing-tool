/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Tag } from "./tag.model";

export class Analysis {
    public id: number=0;
    public name: string ="";
    public url: string="";
    public source: string ="";
    public tags: number[]=[];
    public created_at: Date;
    public updated_at: Date;
    public evaluation:number | null = null;

    constructor() {
        this.created_at = new Date();
        this.updated_at = new Date();
    }
}

