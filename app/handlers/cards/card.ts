import { Collector } from "../collectors/collector";

export abstract class Card {
    _name: string;
    _collector: Collector;

    constructor(name: string, collector) {
        this._name = name;
        this._collector = collector;
    }

    get name() {
        return this._name;
    }

    get collector() {
        return this._collector;
    }

    get logger() {
        return this.collector.logger;
    }

    get contents(){
        return this.collector.contents;
    }

    abstract enable();
    abstract disable();
    abstract inspect(output);

    launch();

    clear(){};
}