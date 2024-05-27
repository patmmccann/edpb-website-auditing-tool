/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Card } from "../card.model";

export class GlobalCard extends Card {

    constructor(name:string){
        super(name, "global");
    }
}
