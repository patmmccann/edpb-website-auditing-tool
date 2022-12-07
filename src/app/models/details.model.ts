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

    constructor(kind: kindDetail) {
        this.kind = kind;
        this.status = 'pending';
    }
}
