import { Card } from "../card.model";

export class GlobalCard extends Card {

    constructor(name:string){
        super(name, "global");
        this.allow_evaluation = false;
    }
}
