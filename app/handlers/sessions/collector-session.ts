
const logger = require("../../../lib/logger");

export class CollectorSession {

    _output :any = null;
    _hosts : any;
    _logger : any;
    _refs_regexp : RegExp;
    _uri_ins : string;
    _uri_ins_host:string;
    _uri_refs : string[];
    
    constructor(){
       this.clear();
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

        this._logger = logger.create({});
    }

    get hosts(){
        return this._hosts;
    }

    get logger(){
        return this._logger;
    }

    get refs_regexp(){
        return this._refs_regexp;
    }

    get uri_ins(){
        return this._uri_ins;
    }

    get uri_ins_host(){
        return this._uri_ins_host;
    }

    get uri_refs(){
        return this._uri_refs;
    }
}