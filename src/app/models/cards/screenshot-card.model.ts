import { Card } from "../card.model";

export class ScreenshotCard extends Card{
    public image : Blob = new Blob();
    
    constructor(name:string){
        super(name, "image");
        this.is_name_editable = true;
    }
}
