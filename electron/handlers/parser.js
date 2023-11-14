"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserHandlher = void 0;
const electron_1 = require("electron");
const collector = require("../../collector/index");
const logger = require("../../lib/logger");
const inspector = require("../../inspector/index");
class ParserHandlher {
    constructor() {
    }
    registerHandlers() {
        electron_1.ipcMain.handle('parseHar', this.parseHar);
    }
    parseHar(event, har, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const collect = yield collector(args, logger.create({}, args));
            yield collect.createSessionFromHar(har);
            yield collect.collectCookies();
            yield logger.waitForComplete(collect.logger);
            const inspect = yield inspector(args, collect.logger, collect.pageSession, collect.output);
            yield inspect.inspectCookies();
            yield inspect.inspectBeacons();
            yield inspect.inspectHosts();
            return collect.output;
        });
    }
    unregisterHandlers() {
        electron_1.ipcMain.removeHandler('parseHar');
    }
}
exports.ParserHandlher = ParserHandlher;
