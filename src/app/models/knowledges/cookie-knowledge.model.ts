import { Knowledge } from "../knowledge.model";

export class CookieKnowledge extends Knowledge{
    public domain: string = ""; 
    public name: string = "";
    public category: string = "";
    public source: string = "";
    public controller: string = "";
    public date: string = "";
    public policy: string = "";
    public reference: string = "";
    public comment: string = "";
    
    constructor(){
        super('cookie');
    }
}
