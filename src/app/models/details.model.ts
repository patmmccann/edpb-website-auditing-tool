/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Status } from "./evaluation.model";

export type kindDetail = ''|
'cookie'|
'beacon'|
'localstorage' |
'protocol' |
'vulnerability' |
'unsafeForm';

export class Details {
    public kind: kindDetail;
    public status:Status;
    public idx:number;

    constructor(kind: kindDetail, idx:number) {
        this.kind = kind;
        this.status = 'pending';
        this.idx = idx;
    }
}
