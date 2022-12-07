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
