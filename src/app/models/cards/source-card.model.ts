import { Card } from "../card.model";

export class SourceCard extends Card{
    public source:string ="";

    constructor(name:string){
        super(name, "html");
    }
}
