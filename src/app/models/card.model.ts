/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
export type kindCard = '' |
    'beacons' |
    'cookie' |
    'global' |
    'https' |
    'links' |
    'localstorage' |
    'image' |
    'html'|
    'testSSL' |
    'traffic' |
    'forms' |
    'info';

export const allKindCard : kindCard[] = ['beacons',
'cookie' ,
'global' ,
'https' ,
'links' ,
'localstorage' ,
'image' ,
'html',
'testSSL' ,
'traffic' ,
'forms' ,
'info']

export type viewContext = "view"| "evaluate";


export class Card {
    public kind: kindCard;
    public name: string;
    public id: number = 0;
    public evaluation: number | null = null;

    constructor(name: string, kind: kindCard) {
        this.name = name;
        this.kind = kind;
    }

    toJson(){
        return this;
    }
}
