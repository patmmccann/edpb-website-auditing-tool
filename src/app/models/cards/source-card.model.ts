/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Card } from "../card.model";

export class SourceCard extends Card{
    public source:string ="";

    constructor(name:string){
        super(name, "html");
    }
}
