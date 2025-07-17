"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = createContext;
var index_1 = require("../index");
function createContext(_a) {
    var req = _a.req, res = _a.res;
    return { req: req, res: res, prisma: index_1.prisma };
}
