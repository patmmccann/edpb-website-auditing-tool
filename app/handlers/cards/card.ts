import { CollectorSession } from "../sessions/collector-session";

export abstract class Card {
    _name: string;
    _collector: CollectorSession;

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

    abstract enable();
    abstract disable();
    abstract inspect();
}