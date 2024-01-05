/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Card } from "./card.model";

export class Tag {
    public id: number=0;
    public name: string;
    public created_at: Date;
    public updated_at: Date;
    public cards:number[] = [];
    public source:string = "";
    public evaluation:number | null = null;
    
    constructor(name: string) {
        this.name = name;
        this.created_at = new Date();
        this.updated_at = new Date();
    }
}
