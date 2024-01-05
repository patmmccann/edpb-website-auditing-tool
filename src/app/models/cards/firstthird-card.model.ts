/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Card, kindCard } from "../card.model";

export class FirstThirdCard extends Card{
    public firstParty : any[];
    public thirdParty : any[];

    constructor(name:string, kind:kindCard){
        super(name, kind);
        this.firstParty = [];
        this.thirdParty = [];
    }
}
