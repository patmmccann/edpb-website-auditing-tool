import { Card } from "../card.model";

export class WebsiteCard extends Card{
    url:string ="";
    constructor(){
        super("Webpage", "info");
    }

}
