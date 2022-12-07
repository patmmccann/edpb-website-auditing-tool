import { Card } from "../card.model";
import { Details } from "../details.model";

export class UnsafeForm extends Details{
    id:string="";
    action:string="";
    method:string="";

    constructor(id:string, action:string, method:string){
        super('unsafeForm');
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
        for (let line of unsafeForms){
            this.unsafeForms.push(new UnsafeForm(line.id, line.action, line.method))
        }
    }

    override get help():string {
        return "The source code of the currently displayed webpage is analyzed in order to check if data may be send through unsecure (HTTP) communication."
    } 
}
