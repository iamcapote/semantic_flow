"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
var trpc_1 = require("../trpc");
exports.userRouter = (0, trpc_1.router)({
    // Placeholder for get
    get: trpc_1.publicProcedure.query(function () {
        return { id: '1', name: 'Test User' };
    }),
});
