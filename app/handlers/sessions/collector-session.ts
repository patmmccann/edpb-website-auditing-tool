
export class CollectorSession {

    _output :any = null;
    _hosts : any;
    
    constructor(){
       this.clear();
    }

    create(){

    }

    delete(){
        
    }

    clear(){
        this._hosts = {
            requests: {
                firstParty: new Set(),
                thirdParty: new Set(),
            },
            beacons: {
                firstParty: new Set(),
                thirdParty: new Set(),
            },
            cookies: {
                firstParty: new Set(),
                thirdParty: new Set(),
            },
            localStorage: {
                firstParty: new Set(),
                thirdParty: new Set(),
            },
            links: {
                firstParty: new Set(),
                thirdParty: new Set(),
            },
        }
    }

    get hosts(){
        return this._hosts;
    }
}