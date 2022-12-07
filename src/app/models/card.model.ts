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
    public allow_evaluation : boolean = true;
    public is_name_editable : boolean = false;
    public evaluation: number | null = null;
    public is_runnable : boolean = false;

    constructor(name: string, kind: kindCard) {
        this.name = name;
        this.kind = kind;
    }

    get help():string {
        return "";
    } 
}
